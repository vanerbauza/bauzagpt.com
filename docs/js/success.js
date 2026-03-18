import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("session_id");
const statusEl = document.getElementById("status");
const downloadLink = document.getElementById("download");
const POLL_INTERVAL_MS = 6000;
let orderId = null;

function waitForConfig(timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      if (window.BACKEND_URL) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error("config_timeout"));
        return;
      }

      setTimeout(check, 50);
    };

    check();
  });
}

function waitForAuthenticatedUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();

        if (!user) {
          reject(new Error("auth_required"));
          return;
        }

        resolve(user);
      },
      reject
    );
  });
}

async function getAuthHeaders() {
  const user = auth.currentUser || await waitForAuthenticatedUser();
  const token = await user.getIdToken();

  return {
    "Authorization": `Bearer ${token}`
  };
}

async function downloadPdf() {
  if (!orderId) {
    throw new Error("missing_order_id");
  }

  const response = await fetch(`${window.BACKEND_URL}/api/orders/${orderId}/pdf`, {
    headers: await getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`pdf_download_failed_${response.status}`);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = blobUrl;
  anchor.download = `bauzagpt-osint-${orderId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

async function checkPDF() {
  try {
    if (!orderId) {
      throw new Error("missing_order_id");
    }

    const res = await fetch(`${window.BACKEND_URL}/api/orders/${orderId}`, {
      headers: await getAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(`order_status_failed_${res.status}`);
    }

    const data = await res.json();

    if (data.status === "ready") {
      statusEl.innerText = "Informe listo para descargar.";
      downloadLink.style.display = "block";
      return;
    }

    if (data.status === "error") {
      statusEl.innerText = data.errorMessage
        ? `El informe falló: ${data.errorMessage}`
        : "El informe falló durante el procesamiento.";
      downloadLink.style.display = "none";
      return;
    }

    if (data.status === "processing") {
      statusEl.innerText = "Procesando fuentes OSINT y armando el PDF…";
      setTimeout(checkPDF, POLL_INTERVAL_MS);
      return;
    }

    if (data.status === "paid") {
      statusEl.innerText = "Pago confirmado. El análisis OSINT está por comenzar…";
      setTimeout(checkPDF, POLL_INTERVAL_MS);
      return;
    }

    statusEl.innerText = "Generando informe…";
    setTimeout(checkPDF, POLL_INTERVAL_MS);
  } catch (err) {
    console.error("Error verificando el informe en checkPDF:", err);
    statusEl.innerText = "Error verificando el informe.";
    setTimeout(checkPDF, POLL_INTERVAL_MS);
  }
}

async function validateSession() {
  try {
    const res = await fetch(`${window.BACKEND_URL}/api/stripe/session/${sessionId}`, {
      headers: await getAuthHeaders()
    });

    if (!res.ok) {
      statusEl.innerText = "Error validando la sesión.";
      console.error("Error en /api/stripe/session:", res.status);
      return;
    }

    const data = await res.json();

    if (!data?.orderId) {
      statusEl.innerText = "Error validando la sesión.";
      console.error("Respuesta inválida de /api/stripe/session:", data);
      return;
    }

    orderId = data.orderId;
    statusEl.innerText = "Pago recibido. Generando informe…";
    setTimeout(checkPDF, POLL_INTERVAL_MS);
  } catch (err) {
    console.error("Error comunicando con el servidor en validateSession:", err);
    statusEl.innerText = "Error comunicando con el servidor.";
  }
}

downloadLink?.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    await downloadPdf();
  } catch (error) {
    console.error("Error descargando PDF:", error);
    statusEl.innerText = "Error descargando el informe.";
  }
});

if (!sessionId) {
  statusEl.innerText = "Error: no se encontró el ID de sesión.";
  throw new Error("Missing session_id");
}

waitForConfig()
  .then(waitForAuthenticatedUser)
  .then(validateSession)
  .catch((error) => {
    console.error("Error inicializando success.js:", error);
    statusEl.innerText = "Tu sesión expiró. Inicia sesión nuevamente para ver tu informe.";
  });
