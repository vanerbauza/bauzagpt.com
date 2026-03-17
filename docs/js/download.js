import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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
  } catch (error) {
    console.error("[download] Init error:", error);
    if (btn) {
      btn.disabled = true;
    }
    if (status) {
      status.textContent = "Inicia sesión de nuevo para descargar tu informe.";
    }
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
      } catch (error) {
        console.error("[download] Error descargando PDF:", error);
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
