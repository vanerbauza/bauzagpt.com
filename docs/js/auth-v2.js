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
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const status = document.getElementById("auth-status");
  const searchSection = document.getElementById("search-section");

  if (!btnLogin || !btnLogout || !status) {
    console.error("[Auth] No se encontraron elementos de UI", {
      btnLogin: !!btnLogin,
      btnLogout: !!btnLogout,
      status: !!status
    });
    return;
  }

  btnLogin.onclick = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("[Auth] Error Google login:", err);
      alert("Error al iniciar sesión con Google");
    }
  };

  btnLogout.onclick = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("[Auth] Error logout:", err);
    }
  };

  onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (user) {
      status.textContent = `Sesión iniciada: ${user.email}`;
      btnLogin.classList.add("hidden");
      btnLogout.classList.remove("hidden");

      if (searchSection) searchSection.classList.remove("hidden");
    } else {
      status.textContent = "No has iniciado sesión";
      btnLogin.classList.remove("hidden");
      btnLogout.classList.add("hidden");

      if (searchSection) searchSection.classList.add("hidden");
    }
  });
}

export function getCurrentUser() {
  return currentUser;
}
