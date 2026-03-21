import {
  createReauthHomeHref,
  getAuthHeaders,
  hideReauthLink,
  showReauthLink,
  waitForAuthenticatedUser,
  waitForConfig
} from "./auth-session.js";

function showDownloadAuthHelp(status) {
  if (status) {
    status.textContent = "No pudimos restaurar tu sesión. Vuelve al inicio, inicia sesión y regresarás automáticamente a esta descarga.";
  }

  showReauthLink({
    anchorId: "download-reauth-link",
    afterElement: status,
    href: createReauthHomeHref(),
    text: "Volver al inicio para iniciar sesión y continuar con la descarga"
  });
}

async function initDownload() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");
  const btn = document.getElementById("downloadBtn");
  const status = document.getElementById("downloadStatus");

  if (!orderId) {
    if (btn) {
      btn.disabled = true;
    }
    if (status) {
      status.textContent = "Error: falta el ID de orden.";
    }
    console.error("[download] Missing orderId in URL");
    return;
  }

  try {
    await waitForConfig();
    await waitForAuthenticatedUser();
    hideReauthLink("download-reauth-link");
  } catch (error) {
    console.error("[download] Init error:", error);
    if (btn) {
      btn.disabled = true;
    }
    showDownloadAuthHelp(status);
    return;
  }

  if (btn) {
    btn.addEventListener("click", async () => {
      try {
        btn.disabled = true;
        if (status) {
          status.textContent = "Preparando descarga...";
        }

        const response = await fetch(`${window.BACKEND_URL}/api/orders/${orderId}/pdf`, {
          headers: await getAuthHeaders()
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("auth_required");
          }

          throw new Error(`download_failed_${response.status}`);
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

        if (status) {
          status.textContent = "Descarga iniciada.";
        }
        hideReauthLink("download-reauth-link");
      } catch (error) {
        console.error("[download] Error descargando PDF:", error);

        if (error?.message === "auth_required") {
          showDownloadAuthHelp(status);
          return;
        }

        if (status) {
          status.textContent = "No se pudo descargar el informe.";
        }
      } finally {
        btn.disabled = false;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initDownload);
