// docs/js/auth.js
// Manejo de autenticación Google con Firebase

import { auth } from "./firebase-init.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const provider = new GoogleAuthProvider();
let currentUser = null;

export function initAuth() {
  const googleContainer = document.getElementById("google-login");
  const btnLogout      = document.getElementById("btn-logout");
  const status         = document.getElementById("auth-status");

  if (!googleContainer || !btnLogout || !status) {
    console.warn("Auth UI elements not found");
    return;
  }

  // Crear botón de login Google dinámicamente
  const btnLogin = document.createElement("button");
  btnLogin.textContent = "Iniciar sesión con Google";
  btnLogin.className = "btn primary";

  btnLogin.onclick = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google login error:", err);
      alert("Error al iniciar sesión con Google");
    }
  };

  googleContainer.appendChild(btnLogin);

  btnLogout.onclick = async () => {
    await signOut(auth);
  };

  onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (user) {
      status.textContent = `Sesión iniciada: ${user.email}`;
      btnLogin.style.display = "none";
      btnLogout.style.display = "inline-block";
    } else {
      status.textContent = "No has iniciado sesión";
      btnLogin.style.display = "inline-block";
      btnLogout.style.display = "none";
    }
  });
}

export function getCurrentUser() {
  return currentUser;
}
