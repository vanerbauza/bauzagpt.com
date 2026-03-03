import { auth, provider } from "./firebase-init.js";
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const authStatus = document.getElementById("auth-status");

  // --- Estado de autenticación ---
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      authStatus.textContent = "Sesión iniciada como: " + user.email;
      btnLogin.classList.add("hidden");
      btnLogout.classList.remove("hidden");

      try {
        const token = await user.getIdToken();

        // Protección: BACKEND_URL puede no estar listo si load-config.js tarda
        if (!window.BACKEND_URL) {
          console.warn("BACKEND_URL aún no está disponible. Reintentando en 300 ms...");
          setTimeout(() => onAuthStateChanged(auth, () => {}), 300);
          return;
        }

        await fetch(`${window.BACKEND_URL}/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });

      } catch (err) {
        console.error("Error verificando token con backend:", err);
      }

    } else {
      authStatus.textContent = "No has iniciado sesión";
      btnLogin.classList.remove("hidden");
      btnLogout.classList.add("hidden");
    }
  });

  // --- Login con Google ---
  btnLogin.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);

    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        console.log("El usuario cerró el popup antes de completar el login.");
        return;
      }

      if (error.code === "auth/cancelled-popup-request") {
        console.log("Se intentó abrir más de un popup de login.");
        return;
      }

      console.error("Error inesperado en login:", error);
    }
  });

  // --- Logout ---
  btnLogout.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }
  });
});
