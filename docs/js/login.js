// /docs/js/login.js
import { auth } from "./firebase-init.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

const btn = document.getElementById("btn-google");

btn?.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);

    const token = await user.getIdToken();
    localStorage.setItem("bauza_token", token);
    localStorage.setItem("bauza_email", user.email || "");
    localStorage.setItem("bauza_uid", user.uid);

    location.href = "./osint.html";
  } catch (e) {
    console.error(e);
    alert("login falló: " + (e?.message || e));
  }
});
