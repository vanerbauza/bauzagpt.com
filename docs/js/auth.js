// /docs/js/auth.js
import { auth } from "./firebase-init.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const provider = new GoogleAuthProvider();
let currentUser = null;

function getEl(id) {
  return document.getElementById(id);
}

function ensureLoginButton() {
  // Caso A: ya existe un botón explícito
  let btnLogin = getEl("btn-login");
  if (btnLogin) return btnLogin;

  // Caso B: existe contenedor donde debemos crearlo
  const container = getEl("google-login");
  if (!container) return null;

  // Evitar duplicados si se llama 2 veces
  btnLogin = container.querySelector("#btn-login");
  if (btnLogin) return btnLogin;

  btnLogin = document.createElement("button");
  btnLogin.id = "btn-login";
  btnLogin.className = "btn primary";
  btnLogin.textContent = "Iniciar sesión con Google";
  container.appendChild(btnLogin);

  return btnLogin;
}

export function initAuth() {
  const status = getEl("auth-status") || getEl("auth-message");
  const btnLogout = getEl("btn-logout") || getEl("logout-btn");
  const btnLogin = ensureLoginButton();

  if (!status || !btnLogout || !btnLogin) {
    console.warn("Auth UI elements not found", {
      status: !!status,
      btnLogout: !!btnLogout,
      btnLogin: !!btnLogin
    });
    return;
  }

  btnLogin.onclick = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google login error:", err);
      alert("Error al iniciar sesión con Google");
    }
  };

  btnLogout.onclick = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (user) {
      status.textContent = `Sesión iniciada: ${user.email}`;
      btnLogin.style.display = "none";
      btnLogout.style.display = "inline-block";

      const searchSection = getEl("search-section");
      if (searchSection) searchSection.style.display = "block";
    } else {
      status.textContent = "No has iniciado sesión";
      btnLogin.style.display = "inline-block";
      btnLogout.style.display = "none";

      const searchSection = getEl("search-section");
      if (searchSection) searchSection.style.display = "none";
    }
  });
}

export function getCurrentUser() {
  return currentUser;
}
