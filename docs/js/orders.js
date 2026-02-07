// docs/js/orders.js
// Frontend: crea orden autenticada y redirige a Stripe Checkout

import { auth } from "./firebase-init.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// ==============================
// CONFIGURACIÓN
// ==============================
const API_BASE = "https://bauzagpt-backend.fly.dev";

// ==============================
// API CALL
// ==============================
async function createOrder(target) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  // Token Firebase FORZADO (evita expirados)
  const token = await user.getIdToken(true);

  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ target })
  });

  if (!res.ok) {
    let msg = "Error creando la orden";
    try {
      const j = await res.json();
      msg = j.error || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json(); // { orderId, checkoutUrl }
}

// ==============================
// INIT
// ==============================
export function initOrders() {
  const searchSection = document.getElementById("search-section");
  const btnCreate = document.getElementById("btn-create-order");

  // Mostrar sección solo si hay sesión
  onAuthStateChanged(auth, (user) => {
    if (searchSection) {
      searchSection.style.display = user ? "block" : "none";
    }
  });

  // Crear orden → redirigir a Stripe
  if (btnCreate) {
    btnCreate.onclick = async () => {
      const input = document.getElementById("targetInput");
      const target = input?.value?.trim();

      if (!target) {
        alert("Introduce un objetivo de búsqueda");
        return;
      }

      try {
        const order = await createOrder(target);
        // Stripe decide a partir de aquí
        window.location.href = order.checkoutUrl;
      } catch (err) {
        alert(err.message);
      }
    };
  }
}
