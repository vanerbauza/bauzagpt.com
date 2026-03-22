import {
  createReauthHomeHref,
  getAuthHeaders,
  hideReauthLink,
  showReauthLink,
  waitForAuthenticatedUser,
  waitForConfig
} from "./auth-session.js";

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("session_id");
const statusEl = document.getElementById("status");
const downloadLink = document.getElementById("download");
const POLL_INTERVAL_MS = 6000;
let orderId = null;
let autoDownloadTriggered = false;
let pollTimeoutId = null;

function showSuccessAuthHelp() {
  if (statusEl) {
    statusEl.innerText = "No pudimos restaurar tu sesión. Vuelve al inicio, inicia sesión y regresarás automáticamente para ver tu informe.";
  }

  downloadLink.style.display = "none";
  showReauthLink({
    anchorId: "success-reauth-link",
    afterElement: statusEl,
    href: createReauthHomeHref(),
    text: "Volver al inicio para iniciar sesión y continuar con tu compra"
  });
}

function isAuthError(error) {
  return error?.message === "auth_required"
    || error?.message?.endsWith("_401")
    || error?.message?.endsWith("_403");
}

async function downloadPdf() {
  if (!orderId) {
    throw new Error("missing_order_id");
  }

  const response = await fetch(`${window.BACKEND_URL}/api/orders/${orderId}/pdf`, {
    headers: await getAuthHeaders()
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("auth_required");
    }

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

function scheduleCheck() {
  if (pollTimeoutId) {
    clearTimeout(pollTimeoutId);
  }

  pollTimeoutId = setTimeout(checkPDF, POLL_INTERVAL_MS);
}

async function triggerAutoDownload() {
  if (autoDownloadTriggered) {
    return;
  }

  autoDownloadTriggered = true;

  try {
    statusEl.innerText = "Informe listo. Iniciando descarga del PDF…";
    await downloadPdf();
    statusEl.innerText = "Informe listo. Si la descarga no comenzo, usa el enlace manual.";
    downloadLink.style.display = "block";
    hideReauthLink("success-reauth-link");
  } catch (error) {
    autoDownloadTriggered = false;
    console.error("Error en descarga automatica del PDF:", error);

    if (isAuthError(error)) {
      showSuccessAuthHelp();
      return;
    }

    statusEl.innerText = "Informe listo. La descarga automatica fallo; usa el enlace manual.";
    downloadLink.style.display = "block";
  }
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
      if (res.status === 401 || res.status === 403) {
        throw new Error("auth_required");
      }

      throw new Error(`order_status_failed_${res.status}`);
    }

    const data = await res.json();

    if (data.status === "ready") {
      downloadLink.style.display = "block";
      await triggerAutoDownload();
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
      scheduleCheck();
      return;
    }

    if (data.status === "paid") {
      statusEl.innerText = "Pago confirmado. El análisis OSINT está por comenzar…";
      scheduleCheck();
      return;
    }

    statusEl.innerText = "Generando informe y preparando la descarga…";
    scheduleCheck();
  } catch (err) {
    console.error("Error verificando el informe en checkPDF:", err);

    if (isAuthError(err)) {
      showSuccessAuthHelp();
      return;
    }

    statusEl.innerText = "Error verificando el informe.";
    scheduleCheck();
  }
}

async function validateSession() {
  try {
    const res = await fetch(`${window.BACKEND_URL}/api/stripe/session/${sessionId}`, {
      headers: await getAuthHeaders()
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("auth_required");
      }

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
    statusEl.innerText = "Pago recibido. Generando informe y preparando la descarga…";
    hideReauthLink("success-reauth-link");
    await checkPDF();
  } catch (err) {
    console.error("Error comunicando con el servidor en validateSession:", err);

    if (isAuthError(err)) {
      showSuccessAuthHelp();
      return;
    }

    statusEl.innerText = "Error comunicando con el servidor.";
  }
}

downloadLink?.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    await downloadPdf();
    hideReauthLink("success-reauth-link");
  } catch (error) {
    console.error("Error descargando PDF:", error);

    if (isAuthError(error)) {
      showSuccessAuthHelp();
      return;
    }

    statusEl.innerText = "Error descargando el informe.";
  }
});

if (!sessionId) {
  statusEl.innerText = "Error: no se encontró el ID de sesión.";
  throw new Error("Missing session_id");
}

async function initSuccess() {
  try {
    await waitForConfig();
    await waitForAuthenticatedUser();
    hideReauthLink("success-reauth-link");
    await validateSession();
  } catch (error) {
    console.error("Error inicializando success.js:", error);

    if (isAuthError(error)) {
      showSuccessAuthHelp();
      return;
    }

    statusEl.innerText = "No se pudo inicializar el seguimiento del informe.";
  }
}

initSuccess();
