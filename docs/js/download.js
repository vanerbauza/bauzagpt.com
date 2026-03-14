// download.js — BauzaGPT
// Handles OSINT report download from download.html

function waitForConfig() {
  return new Promise(resolve => {
    const check = () => {
      if (window.__CONFIG && window.__CONFIG.BACKEND_URL) {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

async function initDownload() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");
  const btn = document.getElementById("downloadBtn");

  if (!orderId) {
    if (btn) btn.textContent = "Error: falta el ID de orden.";
    console.error("[download] Missing orderId in URL");
    return;
  }

  await waitForConfig();

  const BACKEND = window.__CONFIG.BACKEND_URL;

  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = `${BACKEND}/api/orders/${orderId}/pdf`;
    });
  }
}

document.addEventListener("DOMContentLoaded", initDownload);
