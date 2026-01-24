// docs/js/orders.js
console.log("orders.js cargado");

import { auth } from "./firebase-init.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// API base (local / prod)
const API_BASE = "http://localhost:8080";

let currentOrderId = null;
let pollTimer = null;

/**
 * Crear orden PRO
 */
async function createOrder(target) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const token = await user.getIdToken();

  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
	   "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      plan: "PRO",
      target
    })
  });

  if (!res.ok) {
    let msg = "Error creando orden";
    try {
      const j = await res.json();
      msg = j.error || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

/**
 * Consultar estado de la orden
 */
async function getOrderStatus() {
  const user = auth.currentUser;
  if (!user || !currentOrderId) return null;

  const res = await fetch(`${API_BASE}/api/orders/${currentOrderId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) return null;
  return res.json();
}

/**
 * Polling cada 15 segundos
 */
function startPolling() {
  if (pollTimer) clearInterval(pollTimer);

  pollTimer = setInterval(async () => {
    try {
      const data = await getOrderStatus();
      if (!data) return;

      const statusEl = document.getElementById("orderStatus");
      if (statusEl) statusEl.textContent = data.status;

      if (data.status === "ready") {
        clearInterval(pollTimer);
        showDownload();
      }
    } catch (e) {
      console.error("Polling error:", e);
    }
  }, 15000);
}

/**
 * Mostrar botón de descarga
 */
function showDownload() {
  const btn = document.getElementById("btnDownload");
  if (!btn) return;

  btn.style.display = "inline-block";
  btn.onclick = () => {
    window.location.href = `${API_BASE}/api/orders/${currentOrderId}/download`;
  };
}

/**
 * Conectar UI
 */
function bindUI() {
  console.log("bindUI ejecutado");

  const btn = document.getElementById("btn-create-order");
  if (!btn) {
    console.error("btnGenerate no encontrado");
    return;
  }

  btn.onclick = async () => {
    console.log("CLICK Generate report");

    const targetEl = document.getElementById("targetInput");
    const target = targetEl?.value?.trim();

    if (!target) {
      alert("Introduce un objetivo de búsqueda");
      return;
    }

    try {
      const order = await createOrder(target);
      currentOrderId = order.orderId;

      const statusEl = document.getElementById("orderStatus");
      const refEl = document.getElementById("referenceCode");
      const instEl = document.getElementById("instructions");

      if (statusEl) statusEl.textContent = order.status;
      if (refEl) refEl.textContent = order.referenceCode || "";
      if (instEl) instEl.textContent = order.instructions || "";

      if (order.status !== "ready") {
        startPolling();
      } else {
        showDownload();
      }
    } catch (e) {
      alert(e.message);
    }
  };
}

/**
 * Esperar DOM + Auth
 */
window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM listo");

  // Si el usuario ya estaba logueado
  if (auth.currentUser) {
    bindUI();
  }

  // Cambios de estado de auth
  onAuthStateChanged(auth, (user) => {
    if (user) {
      bindUI();
    }
  });
});
