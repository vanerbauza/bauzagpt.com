<<<<<<< HEAD
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

=======
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3a7cv735RQPYsXMdn4KWQ-NDugL7WyfI",
  authDomain: "studio-6473341422-75630.firebaseapp.com",
  projectId: "studio-6473341422-75630",
  storageBucket: "studio-6473341422-75630.firebasestorage.app",
  messagingSenderId: "240684953453",
  appId: "1:240684953453:web:6027f3b025c9ee22e8b464"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.getElementById("btn-google")?.addEventListener("click", async () => {
  try {
    const { user } = await signInWithPopup(auth, provider);
    const token = await user.getIdToken();
    localStorage.setItem("bauza_token", token);
>>>>>>> ae659de (landing final + flujo premium + login)
    location.href = "./osint.html";
  } catch (e) {
    console.error(e);
    alert("login falló: " + (e?.message || e));
  }
});
