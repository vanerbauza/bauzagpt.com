// js/success.js
import { watchAuthState, getStoredToken } from "./firebase.js";
import { downloadPdf } from "./api.js";

const $ = (s) => document.querySelector(s);

function setStatus(t) { $("#status").textContent = t; }

async function onDownload() {
  try {
    const orderId = localStorage.getItem("lastOrderId");
    if (!orderId) {
      alert("No hay orderId guardado.");
      return;
    }

    setStatus("Descargando PDF...");
    const blob = await downloadPdf(orderId);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bauzagpt-${orderId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    setStatus("Listo.");
    // opcional: limpiar
    // localStorage.removeItem("lastOrderId");
  } catch (e) {
    console.error(e);
    setStatus("Aún no está listo.");
    alert("El reporte aún no está listo (o falta marcar la orden como ready).");
  }
}

function boot() {
  $("#downloadBtn").addEventListener("click", onDownload);

  watchAuthState((user) => {
    if (!user || !getStoredToken()) {
      setStatus("Inicia sesión para descargar el PDF.");
    } else {
      setStatus("Pago confirmado. Puedes intentar descargar el PDF.");
    }
  });
}

boot();
