
// frontend/js/login.js
// Rol: Autenticación de usuario (Google)
// NO orquesta UI global

import { auth } from "./firebase-init.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// ---------------------------------------------
// DOM READY
// ---------------------------------------------
document.addEventListener("DOMContentLoaded", initLogin);

// ---------------------------------------------
// INIT
// ---------------------------------------------
function initLogin() {
  const btnGoogle = document.getElementById("btn-google");
  const btnClose  = document.getElementById("btn-close");
  const dlg       = document.getElementById("dlg");

  if (btnGoogle) btnGoogle.addEventListener("click", loginWithGoogle);
  if (btnClose)  btnClose.addEventListener("click", () => dlg?.close());

  handleRedirectResult(dlg);
}

// ---------------------------------------------
// AUTH FLOW
// ---------------------------------------------
async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    await signInWithPopup(auth, provider);
    closeDialog();
  } catch (err) {
    if (err?.code === "auth/popup-blocked") {
      await signInWithRedirect(auth, provider);
    } else {
      reportAuthError(err);
    }
  }
}

async function handleRedirectResult(dlg) {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      dlg?.close();
    }
  } catch (err) {
    reportAuthError(err);
  }
}

// ---------------------------------------------
// HELPERS
// ---------------------------------------------
function closeDialog() {
  const dlg = document.getElementById("dlg");
  dlg?.close();
}

function reportAuthError(err) {
  console.error("AUTH ERROR:", err?.code, err?.message);

  const msg =
    err?.code === "auth/popup-closed-by-user"
      ? "inicio cancelado"
      : "no se pudo iniciar sesión";

  alert(msg);
}
