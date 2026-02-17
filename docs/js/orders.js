import { auth } from "./firebase-init.js";

const BACKEND_URL = "https://bauzagpt-backend.fly.dev";
const TIMEOUT_MS = 60000; // 60 segundos
const MAX_RETRIES = 1; // Reintentar 1 vez solamente

/**
 * Hacer una petición al backend con timeout y reintentos
 * @param {string} url - URL del endpoint
 * @param {object} options - Opciones del fetch
 * @param {number} retryCount - Número de reintentos (uso interno)
 * @returns {Promise<object>} - Respuesta JSON del servidor
 */
async function fetchWithTimeout(url, options = {}, retryCount = 0) {
  // Crear un AbortController NUEVO para esta petición
  const controller = new AbortController();
  let timeoutId = null;

  try {
    console.log(`[Orders] Intento #${retryCount + 1}: enviando petición...`);
    
    // Configurar timeout
    timeoutId = setTimeout(() => {
      console.warn(`[Orders] ⏱ Timeout de ${TIMEOUT_MS / 1000}s alcanzado, abortando...`);
      controller.abort();
    }, TIMEOUT_MS);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Orders] ❌ HTTP ${response.status}: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[Orders] ✅ Respuesta exitosa:", data);
    return data;

  } catch (err) {
    // Detectar si fue timeout
    const isTimeout = err.name === "AbortError";
    
    if (isTimeout) {
      console.warn(`[Orders] ⚠️ Timeout en intento #${retryCount + 1}`);
      
      // Reintentar si quedan intentos
      if (retryCount < MAX_RETRIES) {
        console.log(`[Orders] 🔄 Reintentando... (${retryCount + 1}/${MAX_RETRIES})`);
        return fetchWithTimeout(url, options, retryCount + 1);
      }
      
      // Si se agotaron los reintentos
      const message = `El servidor tardó demasiado en responder (${TIMEOUT_MS / 1000}s). Intenta de nuevo.`;
      console.error(`[Orders] ❌ ${message}`);
      throw new Error(message);
    }

    // Otros errores
    console.error("[Orders] ❌ Error:", err.message);
    throw err;

  } finally {
    // Limpiar el timeout SIEMPRE
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Inicializar el manejador de órdenes
 */
export function initOrders() {
  const btnCreateOrder = document.getElementById("btn-create-order");

  if (!btnCreateOrder) {
    console.error("[Orders] ❌ Botón no encontrado en el DOM");
    return;
  }

  // Usar addEventListener en lugar de onclick para evitar duplicados
  const handleOrderClick = async () => {
    const target = document.getElementById("targetInput").value.trim();

    // Validar que hay un objetivo
    if (!target) {
      alert("Debes ingresar un objetivo.");
      return;
    }

    // Validar que el usuario está autenticado
    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión primero.");
      return;
    }

    try {
      console.log("\n[Orders] 🚀 ==================== NUEVA ORDEN ====================");
      console.log(`[Orders] Usuario: ${user.email}`);
      console.log(`[Orders] Objetivo: ${target}`);

      // Obtener token de Firebase
      console.log("[Orders] 🔐 Obteniendo token de Firebase...");
      const idToken = await user.getIdToken();
      console.log("[Orders] ✅ Token obtenido");

      // Hacer petición al backend
      const data = await fetchWithTimeout(
        `${BACKEND_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify({ target })
        }
      );

      // Validar respuesta
      if (!data.checkoutUrl) {
        console.error("[Orders] ❌ Respuesta sin checkoutUrl:", data);
        alert("Error: No se generó URL de pago.");
        return;
      }

      // Redirigir a Stripe
      console.log("[Orders] 💳 Redirigiendo a Stripe...");
      window.location.href = data.checkoutUrl;

    } catch (err) {
      console.error("[Orders] ❌ Error final:", err.message);
      alert(`Error: ${err.message}`);
    } finally {
      console.log("[Orders] 🏁 ==================== FIN ====================\n");
    }
  };

  // Remover listeners anteriores para evitar duplicados
  btnCreateOrder.replaceWith(btnCreateOrder.cloneNode(true));
  const newBtn = document.getElementById("btn-create-order");
  newBtn.addEventListener("click", handleOrderClick);
}