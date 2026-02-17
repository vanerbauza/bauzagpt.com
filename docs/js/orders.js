import { auth } from "./firebase-init.js";

const BACKEND_URL = "https://bauzagpt-backend.fly.dev";

export function initOrders() {
  const btnCreateOrder = document.getElementById("btn-create-order");

  if (!btnCreateOrder) {
    console.error("[Orders] Botón de orden no encontrado");
    return;
  }

  btnCreateOrder.addEventListener("click", async () => {
    const target = document.getElementById("targetInput").value.trim();

    if (!target) {
      alert("Debes ingresar un objetivo.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Debes iniciar sesión.");
        return;
      }

      console.log("[Orders] Obteniendo token de Firebase...");
      const idToken = await user.getIdToken();
      console.log("[Orders] Token obtenido, enviando petición al backend...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ target }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log("[Orders] Respuesta del backend:", response.status, response.statusText);

      if (!response.ok) {
        console.error("[Orders] Backend respondió con error:", response.status);
        const errorData = await response.text();
        console.error("[Orders] Detalles del error:", errorData);
        alert(`Error del servidor: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      console.log("[Orders] Datos recibidos:", data);

      if (data.checkoutUrl) {
        console.log("[Orders] Redirigiendo a Stripe...");
        window.location.href = data.checkoutUrl;
      } else {
        console.error("[Orders] No hay checkoutUrl en respuesta", data);
        alert("Error: No se generó URL de pago.");
      }

    } catch (err) {
      console.error("[Orders] Error detallado:", {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      if (err.name === "AbortError") {
        alert("La conexión al servidor tardó demasiado. Intenta de nuevo.");
      } else {
        alert(`Error al conectar: ${err.message}`);
      }
    }
  });
}