// docs/js/auth-v2.js

import { auth } from "./firebase-init-v2.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const provider = new GoogleAuthProvider();
let currentUser = null;

/**
 * Devuelve siempre el token actual (refrescado) o null si no hay sesión.
 */
export async function getIdToken() {
  if (!auth.currentUser) return null;
  try {
    const token = await auth.currentUser.getIdToken(true); // force refresh
    localStorage.setItem("token", token);
    return token;
  } catch (err) {
    console.error("[Auth] Error al obtener ID token:", err);
    return null;
  }
}

/**
 * Inicializa la UI de autenticación y el listener de estado.
 */
export function initAuth() {
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const status = document.getElementById("auth-status");
  const searchSection = document.getElementById("search-section");

  if (!btnLogin || !btnLogout || !status) {
    console.error("[Auth] No se encontraron elementos de UI", {
      btnLogin: !!btnLogin,
      btnLogout: !!btnLogout,
      status: !!status,
    });
    return;
  }

  //  LOGIN CON GOOGLE + TOKEN PARA BACKEND
  btnLogin.onclick = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const token = await user.getIdToken(true);
      localStorage.setItem("token", token);

      console.log("[Auth] Login OK:", user.email);
      console.log("[Auth] ID token guardado en localStorage");
    } catch (err) {
      console.error("[Auth] Error Google login:", err);
      alert("Error al iniciar sesión con Google");
    }
  };

  // LOGOUT LIMPIO
  btnLogout.onclick = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      console.log("[Auth] Logout OK");
    } catch (err) {
      console.error("[Auth] Error logout:", err);
    }
  };

  //  SINCRONIZAR UI + TOKEN CON ESTADO DE FIREBASE
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
      status.textContent = `Sesión iniciada: ${user.email}`;
      btnLogin.classList.add("hidden");
      btnLogout.classList.remove("hidden");
      if (searchSection) searchSection.classList.remove("hidden");

      // Refrescar token al cambiar estado
      try {
        const token = await user.getIdToken(true);
        localStorage.setItem("token", token);
        console.log("[Auth] Token actualizado tras onAuthStateChanged");
      } catch (err) {
        console.error("[Auth] Error actualizando token:", err);
      }
    } else {
      status.textContent = "No has iniciado sesión";
      btnLogin.classList.remove("hidden");
      btnLogout.classList.add("hidden");
      if (searchSection) searchSection.classList.add("hidden");

      localStorage.removeItem("token");
    }
  });
}

/**
 * Devuelve el usuario actual (objeto FirebaseUser) o null.
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Helper para hacer fetch autenticado hacia el backend.
 * Siempre manda: Authorization: Bearer <token>
 */
export async function authFetch(url, options = {}) {
  const token = await getIdToken();
  if (!token) {
    console.warn("[Auth] No hay token, request sin auth:", url);
    throw new Error("No hay sesión activa");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, { ...options, headers });
}