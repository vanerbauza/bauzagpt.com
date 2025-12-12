// docs/js/login.js
import { auth } from "./firebase-init.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
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

function setStatus(msg){ if(status) status.textContent = msg; }

btnLogin?.addEventListener("click", () => dlg?.showModal());
btnClose?.addEventListener("click", () => dlg?.close());

btnGoogle?.addEventListener("click", async () => {
  try{
    setStatus("abriendo login…");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    dlg?.close();
    setStatus("sesión iniciada.");
  }catch(e){
    console.error(e);
    setStatus("falló el login (revisa popup / cookies).");
  }
});

btnLogout?.addEventListener("click", async () => {
  try{
    await signOut(auth);
    setStatus("sesión cerrada.");
  }catch(e){
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
