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
  const searchSection = document.getElementById("search-section");
  const termsCheckbox = document.getElementById("terms-checkbox");

  // Habilitar botón de login solo si acepta los términos
  termsCheckbox.addEventListener("change", () => {
    btnLogin.disabled = !termsCheckbox.checked;
  });

  // Función para verificar token con backend
  const verifyTokenWithBackend = async (token) => {
    // Esperar hasta que BACKEND_URL esté disponible
    let attempts = 0;
    while (!window.BACKEND_URL && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.BACKEND_URL) {
      console.error("BACKEND_URL no disponible después de esperar");
      return;
    }

    try {
      await fetch(`${window.BACKEND_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
    } catch (err) {
      console.error("Error verificando token con backend:", err);
    }
  };

  // --- Estado de autenticación ---
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      authStatus.textContent = "Sesión iniciada como: " + user.email;
      btnLogin.classList.add("hidden");
      btnLogout.classList.remove("hidden");
      termsCheckbox.closest(".terms-container").classList.add("hidden");
      
      if (searchSection) {
        searchSection.classList.remove("hidden");
      }

      const token = await user.getIdToken();
      await verifyTokenWithBackend(token);

    } else {
      authStatus.textContent = "No has iniciado sesión";
      btnLogin.classList.remove("hidden");
      btnLogout.classList.add("hidden");
      termsCheckbox.closest(".terms-container").classList.remove("hidden");
      
      if (searchSection) {
        searchSection.classList.add("hidden");
      }
    }
  });

  // --- Login con Google ---
  btnLogin.addEventListener("click", async () => {
    try {
      btnLogin.disabled = true;
      btnLogin.textContent = "Iniciando sesión...";
      
      await signInWithPopup(auth, provider);
      
      btnLogin.textContent = "Iniciar sesión con Google";
      btnLogin.disabled = false;

    } catch (error) {
      btnLogin.textContent = "Iniciar sesión con Google";
      btnLogin.disabled = false;

      if (error.code === "auth/popup-closed-by-user") {
        console.log("El usuario cerró el popup antes de completar el login.");
        return;
      }

      if (error.code === "auth/cancelled-popup-request") {
        console.log("Se intentó abrir más de un popup de login.");
        return;
      }

      if (error.code === "auth/popup-blocked") {
        alert("El navegador bloqueó el popup. Por favor, permite popups para este sitio.");
        return;
      }

      console.error("Error inesperado en login:", error);
      alert("Error al iniciar sesión. Por favor, inténtalo de nuevo.");
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
