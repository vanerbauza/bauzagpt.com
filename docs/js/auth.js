import { auth, provider, facebookProvider } from "./firebase-init.js";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btn-login");
  const btnLoginFacebook = document.getElementById("btn-login-facebook");
  const btnLogout = document.getElementById("btn-logout");
  const authStatus = document.getElementById("auth-status");
  const searchSection = document.getElementById("search-section");
  const termsCheckbox = document.getElementById("terms-checkbox");
  let redirectedAfterLogin = false;

  const getSafeReturnTo = () => {
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get("returnTo");

    if (!returnTo) {
      return null;
    }

    try {
      const url = new URL(returnTo, window.location.origin);

      if (url.origin !== window.location.origin) {
        return null;
      }

      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return null;
    }
  };

  termsCheckbox.addEventListener("change", () => {
    btnLogin.disabled = !termsCheckbox.checked;
    btnLoginFacebook.disabled = !termsCheckbox.checked;
  });

  const verifyTokenWithBackend = async (token) => {
    let attempts = 0;
    while (!window.BACKEND_URL && attempts < 20) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.BACKEND_URL) {
      console.error("[AUTH] BACKEND_URL no disponible");
      return false;
    }

    try {
      const res = await fetch(`${window.BACKEND_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });

      let payload = null;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }

      if (!res.ok) {
        console.warn("[AUTH] Backend verify respondió:", res.status);

        if (res.status === 503 && payload?.error === "firebase_not_initialized") {
          alert("Tu sesión de Firebase se abrió, pero el backend no puede validar usuarios en este momento. Inténtalo de nuevo más tarde.");
        }

        return false;
      }

      return true;
    } catch (err) {
      console.error("[AUTH] Error verificando token con backend:", err);
      return false;
    }
  };

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      authStatus.textContent = "Sesión iniciada como: " + (user.email || user.displayName);
      btnLogin.classList.add("hidden");
      btnLoginFacebook.classList.add("hidden");
      btnLogout.classList.remove("hidden");
      termsCheckbox.closest(".terms-container").classList.add("hidden");

      if (searchSection) {
        searchSection.classList.remove("hidden");
      }

      const token = await user.getIdToken();
      const backendVerified = await verifyTokenWithBackend(token);

      if (!backendVerified) {
        authStatus.textContent = "Sesión iniciada, pero el backend de autenticación no está disponible.";
        return;
      }

      const returnTo = getSafeReturnTo();
      if (returnTo && !redirectedAfterLogin) {
        redirectedAfterLogin = true;
        window.location.assign(returnTo);
      }
    } else {
      authStatus.textContent = "No has iniciado sesión";
      btnLogin.classList.remove("hidden");
      btnLoginFacebook.classList.remove("hidden");
      btnLogout.classList.add("hidden");
      btnLogin.disabled = !termsCheckbox.checked;
      btnLoginFacebook.disabled = !termsCheckbox.checked;
      termsCheckbox.closest(".terms-container").classList.remove("hidden");

      if (searchSection) {
        searchSection.classList.add("hidden");
      }
    }
  });

  btnLogin.addEventListener("click", async () => {
    try {
      btnLogin.disabled = true;
      btnLogin.textContent = "Iniciando sesión...";
      await signInWithPopup(auth, provider);
    } catch (error) {
      btnLogin.textContent = "Iniciar sesión con Google";
      btnLogin.disabled = !termsCheckbox.checked;
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) return;
      console.error("[AUTH] Error iniciando sesión con Google:", error.code, error.message);
      alert(`Error al iniciar sesión (${error.code}). Por favor, inténtalo de nuevo.`);
    }
  });

  btnLoginFacebook.addEventListener("click", async () => {
    try {
      btnLoginFacebook.disabled = true;
      btnLoginFacebook.textContent = "Iniciando sesión...";
      await signInWithPopup(auth, facebookProvider);
    } catch (error) {
      btnLoginFacebook.textContent = "Iniciar sesión con Facebook";
      btnLoginFacebook.disabled = !termsCheckbox.checked;
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) return;
      console.error("[AUTH] Error iniciando sesión con Facebook:", error.code, error.message);
      alert(`Error al iniciar sesión con Facebook (${error.code}). Por favor, inténtalo de nuevo.`);
    }
  });

  btnLogout.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("[AUTH] Error cerrando sesión:", err);
    }
  });
});
