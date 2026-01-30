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

function ensureLoginButton() {
  // Si ya existe, úsalo
  let btn = document.getElementById("btn-login");
  if (btn) return btn;

  // Si no existe, créalo dentro de #google-login
  let host = document.getElementById("google-login");
  if (!host) {
    host = document.createElement("div");
    host.id = "google-login";
    const section = document.getElementById("auth-section") || document.body;
    section.appendChild(host);
  }

  btn = document.createElement("button");
  btn.id = "btn-login";
  btn.type = "button";
  btn.className = "btn primary";
  btn.textContent = "Iniciar sesión con Google";
  host.appendChild(btn);
  return btn;
}

export function initAuth() {
  const btnLogout = document.getElementById("btn-logout");
  const status = document.getElementById("auth-status");
  const btnLogin = ensureLoginButton();

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
