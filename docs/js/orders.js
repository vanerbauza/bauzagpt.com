import { auth } from "./firebase-init.js";

const BACKEND_URL = "https://bauzagpt-backend.fly.dev";
const TIMEOUT_MS = 100000;
const MAX_RETRIES = 100;

/**
 * Fetch con timeout + reintentos
 */
async function fetchWithTimeout(url, options = {}, retryCount = 0) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    console.warn(`[Orders] Timeout de ${TIMEOUT_MS}ms alcanzado, abortando...`);
    controller.abort("timeout");
  }, TIMEOUT_MS);

  try {
    console.log(`[Orders] Petición #${retryCount + 1} a ${url}`);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Orders] HTTP ${response.status}: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[Orders] ✓ Respuesta exitosa del backend:", data);
    return data;

  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError" && err.message === "timeout") {
      console.warn(`[Orders] Timeout en intento #${retryCount + 1}`);

      if (retryCount < MAX_RETRIES) {
        console.log(`[Orders] Reintentando... (${retryCount + 2}/${MAX_RETRIES})`);
        return fetchWithTimeout(url, options, retryCount + 1);
      }

      throw new Error("Timeout después de varios intentos. Verifica tu conexión.");
    }

    if (err.name === "AbortError") {
      console.warn("[Orders] Petición cancelada:", err.message);
      throw new Error("La solicitud fue cancelada.");
    }

    console.error("[Orders] Error de fetch:", err.message);
    throw err;
  }
}

/**
 * Inicializar el manejador de órdenes
 */
export function initOrders() {
  const btnCreateOrder = document.getElementById("btn-create-order");

  if (!btnCreateOrder) {
    console.error("[Orders] Botón no encontrado en el DOM");
    return;
  }

  btnCreateOrder.addEventListener("click", async () => {
    const target = document.getElementById("targetInput").value.trim();

    if (!target) {
      alert("Debes ingresar un objetivo.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión primero.");
      return;
    }

    try {
      console.log("[Orders] Iniciando proceso de orden...");
      console.log(`[Orders] Usuario: ${user.email}`);
      console.log(`[Orders] Objetivo: ${target}`);

      console.log("[Orders] Obteniendo token de Firebase...");
      const idToken = await user.getIdToken();
      console.log("[Orders] Token obtenido ✓");

      const data = await fetchWithTimeout(
        `${BACKEND_URL}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify({ target })
        }
      );

      if (!data.checkoutUrl) {
        console.error("[Orders] Respuesta sin checkoutUrl:", data);
        alert("Error: No se generó URL de pago.");
        return;
      }

      console.log("[Orders] Redirigiendo a Stripe...");
      window.location.href = data.checkoutUrl;

    } catch (err) {
      console.error("[Orders] Error al procesar orden:", {
        name: err.name,
        message: err.message,
        stack: err.stack
      });

      alert(`Error: ${err.message}`);
    }
  });
}