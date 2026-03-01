import { auth, provider } from "./firebase-init.js";
import { signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const authStatus = document.getElementById("auth-status");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      authStatus.textContent = "Sesión iniciada como: " + user.email;
      btnLogin.classList.add("hidden");
      btnLogout.classList.remove("hidden");

      const token = await user.getIdToken();

      await fetch(`${window.BACKEND_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });

    } else {
      authStatus.textContent = "No has iniciado sesión";
      btnLogin.classList.remove("hidden");
      btnLogout.classList.add("hidden");
    }
  });

  btnLogin.addEventListener("click", async () => {
    await signInWithPopup(auth, provider);
  });

  btnLogout.addEventListener("click", async () => {
    await signOut(auth);
  });
});