import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnCreateOrder = document.getElementById("btn-create-order");
  const targetInput = document.getElementById("targetInput");

  if (!btnCreateOrder) {
    return; // Exit if button doesn't exist on this page
  }

  btnCreateOrder.addEventListener("click", async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Debes iniciar sesión primero.");
      return;
    }

    const target = targetInput?.value?.trim();
    if (!target) {
      alert("Por favor, ingresa un objetivo de búsqueda.");
      return;
    }

    if (!window.BACKEND_URL) {
      alert("Error: Configuración no cargada. Recarga la página.");
      return;
    }

    try {
      btnCreateOrder.disabled = true;
      btnCreateOrder.textContent = "Procesando...";

      const token = await user.getIdToken();

      const response = await fetch(`${window.BACKEND_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          target: target,
          type: "osint-report"
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se recibió URL de Stripe");
      }

    } catch (error) {
      console.error("Error creando orden:", error);
      alert("Error al crear la orden. Por favor, inténtalo de nuevo.");
      btnCreateOrder.disabled = false;
      btnCreateOrder.textContent = "Iniciar búsqueda — $20 MXN";
    }
  });
});