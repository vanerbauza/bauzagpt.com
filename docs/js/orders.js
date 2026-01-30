// docs/js/orders.js
// Manejo de creación de órdenes, estado y descarga de PDF

import { auth } from './firebase-init.js';
import {
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

// ==============================
// CONFIGURACIÓN
// ==============================
const API_BASE = 'https://bauzagpt-backend.onrender.com'; 
// ⚠️ Ajusta si tu backend usa otra URL

let currentOrderId = null;
let pollTimer = null;

// ==============================
// API CALLS
// ==============================
async function createOrder(target) {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');

  const token = await user.getIdToken();

  const res = await fetch(`${API_BASE}/api/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      plan: 'PRO',
      target
    })
  });

  if (!res.ok) {
    let msg = 'Error creando la orden';
    try {
      const j = await res.json();
      msg = j.error || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

async function getOrderStatus() {
  const user = auth.currentUser;
  if (!user || !currentOrderId) return null;

  const token = await user.getIdToken();

  const res = await fetch(
    `${API_BASE}/api/checkout/${currentOrderId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!res.ok) return null;
  return res.json();
}

// ==============================
// UI HELPERS
// ==============================
function showDownload() {
  const btn = document.getElementById('btnDownload');
  if (!btn) return;

  btn.style.display = 'inline-block';
  btn.onclick = () => {
    window.location.href =
      `${API_BASE}/api/checkout/${currentOrderId}/download`;
  };
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);

  pollTimer = setInterval(async () => {
    try {
      const data = await getOrderStatus();
      if (!data) return;

      const statusEl = document.getElementById('orderStatus');
      const refEl = document.getElementById('referenceCode');
      const instEl = document.getElementById('instructions');

      if (statusEl) statusEl.textContent = data.status;
      if (refEl) refEl.textContent = data.referenceCode || '';
      if (instEl) instEl.textContent = data.instructions || '';

      if (data.status === 'ready') {
        clearInterval(pollTimer);
        showDownload();
      }
    } catch (err) {
      console.error('[Polling error]', err);
    }
  }, 15000); // cada 15s
}

// ==============================
// INIT
// ==============================
export function initOrders() {
  const searchSection = document.getElementById('search-section');
  const statusSection = document.getElementById('status-section');
  const btnCreate = document.getElementById('btn-create-order');

  // Mostrar / ocultar secciones según auth
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (searchSection) searchSection.style.display = 'block';
    } else {
      if (searchSection) searchSection.style.display = 'none';
      if (statusSection) statusSection.style.display = 'none';
    }
  });

  // Crear orden
  if (btnCreate) {
    btnCreate.onclick = async () => {
      const input = document.getElementById('targetInput');
      const target = input?.value?.trim();

      if (!target) {
        alert('Introduce un objetivo de búsqueda');
        return;
      }

      try {
        const order = await createOrder(target);
        currentOrderId = order.orderId;

        if (statusSection) statusSection.style.display = 'block';

        const statusEl = document.getElementById('orderStatus');
        const refEl = document.getElementById('referenceCode');
        const instEl = document.getElementById('instructions');

        if (statusEl) statusEl.textContent = order.status;
        if (refEl) refEl.textContent = order.referenceCode || '';
        if (instEl) instEl.textContent = order.instructions || '';

        if (order.status === 'ready') {
          showDownload();
        } else {
          startPolling();
        }

      } catch (err) {
        alert(err.message);
      }
    };
  }
}

