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

export function initAuth() {
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const status = document.getElementById("auth-status");

  if (!btnLogin || !btnLogout || !status) {
    console.warn("Auth UI elements not found", {
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

      const searchSection = document.getElementById("search-section");
      if (searchSection) searchSection.style.display = "block";
    } else {
      status.textContent = "No has iniciado sesión";
      btnLogin.style.display = "inline-block";
      btnLogout.style.display = "none";

      const searchSection = document.getElementById("search-section");
      if (searchSection) searchSection.style.display = "none";
    }
  });
}

export function getCurrentUser() {
  return currentUser;
}
