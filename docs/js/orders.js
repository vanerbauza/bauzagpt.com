import { auth, getCurrentUser } from "./auth.js";

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

      const idToken = await user.getIdToken();

      const response = await fetch("https://bauzagpt-backend.fly.dev/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ target })
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Error al iniciar el pago.");
        console.error("[Orders] Error:", data);
      }

    } catch (err) {
      console.error("[Orders] Error:", err);
      alert("Error al conectar con el servidor.");
    }
  });
}