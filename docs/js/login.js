import { auth } from "./firebase-init.js";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const $ = (id) => document.getElementById(id);

const dlg = $("dlg");
const btnLogin = $("btn-login");
const btnLogout = $("btn-logout");
const btnGoogle = $("btn-google");
const btnClose = $("btn-close");
const status = $("status");

function setStatus(msg){ if (status) status.textContent = msg; }

btnLogin?.addEventListener("click", () => dlg?.showModal());
btnClose?.addEventListener("click", () => dlg?.close());

btnGoogle?.addEventListener("click", async () => {
  try {
    setStatus("redirigiendo a Google…");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithRedirect(auth, provider);
  } catch (e) {
    console.error(e);
    setStatus("no se pudo iniciar sesión.");
  }
});

// 👉 Maneja el resultado al volver del redirect
getRedirectResult(auth)
  .then((result) => {
    if (result?.user) {
      dlg?.close();
      setStatus("sesión iniciada.");
    }
  })
  .catch((e) => {
    console.error(e);
    setStatus("falló el login.");
  });

btnLogout?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    setStatus("sesión cerrada.");
  } catch (e) {
    console.error(e);
    setStatus("no se pudo cerrar sesión.");
  }
});

onAuthStateChanged(auth, (user) => {
  const logged = !!user;
  btnLogin?.classList.toggle("hidden", logged);
  btnLogout?.classList.toggle("hidden", !logged);
  setStatus(logged ? `listo, ${user.displayName?.toLowerCase() || "usuario"}.` : "listo.");
});
