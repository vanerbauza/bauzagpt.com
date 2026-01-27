// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { FIREBASE_CONFIG } from "./config.js";

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const LS_TOKEN = "bauza_id_token";
const LS_USER = "bauza_user";

export function getStoredToken() {
  return localStorage.getItem(LS_TOKEN);
}

export function clearStoredSession() {
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_USER);
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, provider);
  const user = cred.user;

  // Firebase ID Token REAL (lo que tu backend valida)
  const idToken = await user.getIdToken(true);

  localStorage.setItem(LS_TOKEN, idToken);
  localStorage.setItem(
    LS_USER,
    JSON.stringify({ uid: user.uid, email: user.email || null, name: user.displayName || null })
  );

  return { uid: user.uid, email: user.email || null, name: user.displayName || null };
}

export async function logout() {
  await signOut(auth);
  clearStoredSession();
}

export function watchAuthState(onChange) {
  // Mantiene token fresco si el usuario sigue logueado
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      clearStoredSession();
      onChange(null);
      return;
    }

    const idToken = await user.getIdToken(false);
    localStorage.setItem(LS_TOKEN, idToken);

    const info = { uid: user.uid, email: user.email || null, name: user.displayName || null };
    localStorage.setItem(LS_USER, JSON.stringify(info));
    onChange(info);
  });
}
