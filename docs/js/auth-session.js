import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const DEFAULT_CONFIG_TIMEOUT_MS = 10000;
const DEFAULT_AUTH_TIMEOUT_MS = 15000;

export function waitForConfig(timeoutMs = DEFAULT_CONFIG_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      if (window.BACKEND_URL) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error("config_timeout"));
        return;
      }

      setTimeout(check, 50);
    };

    check();
  });
}

async function waitForAuthStateReady() {
  if (typeof auth.authStateReady === "function") {
    await auth.authStateReady();
    return auth.currentUser;
  }

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

export async function getResolvedAuthUser() {
  return waitForAuthStateReady();
}

export async function waitForAuthenticatedUser(timeoutMs = DEFAULT_AUTH_TIMEOUT_MS) {
  const restoredUser = await getResolvedAuthUser();

  if (restoredUser) {
    return restoredUser;
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (callback) => (value) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      unsubscribe();
      callback(value);
    };

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          return;
        }

        finish(resolve)(user);
      },
      finish(reject)
    );

    const timeoutId = setTimeout(
      () => finish(reject)(new Error("auth_required")),
      timeoutMs
    );
  });
}

export async function getAuthHeaders() {
  const user = auth.currentUser || await waitForAuthenticatedUser();
  const token = await user.getIdToken();

  return {
    "Authorization": `Bearer ${token}`
  };
}

export function createReauthHomeHref(returnTo = window.location.href) {
  const url = new URL("./", window.location.href);
  url.searchParams.set("returnTo", returnTo);
  return `${url.pathname}${url.search}`;
}

export function showReauthLink({
  anchorId = "reauth-link",
  afterElement,
  href = createReauthHomeHref(),
  text = "Volver al inicio para iniciar sesión"
} = {}) {
  if (!afterElement?.parentElement) {
    return null;
  }

  let link = document.getElementById(anchorId);

  if (!link) {
    link = document.createElement("a");
    link.id = anchorId;
    link.style.display = "inline-block";
    link.style.marginTop = "12px";
    afterElement.insertAdjacentElement("afterend", link);
  }

  link.href = href;
  link.textContent = text;

  return link;
}

export function hideReauthLink(anchorId = "reauth-link") {
  document.getElementById(anchorId)?.remove();
}
