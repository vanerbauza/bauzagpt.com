import { getCurrentUser } from "./auth.js";

const BACKEND_URL = "https://bauzagpt-backend.fly.dev";
const TIMEOUT_MS = 300000; // 5 minutos - sin prisa
const MAX_RETRIES = 10; // Reintentar hasta 10 veces

/**
 * Hacer una petición al backend con timeout y reintentos ilimitados
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
    const attemptNumber = retryCount + 1;
    console.log(`[Orders] 🔄 Intento #${attemptNumber}: conectando con backend...`);
    
    // Configurar timeout (5 minutos)
    timeoutId = setTimeout(() => {
      console.warn(`[Orders] ⏱ Timeout de ${TIMEOUT_MS / 1000 / 60}min alcanzado, abortando intento #${attemptNumber}...`);
      controller.abort();
    }, TIMEOUT_MS);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Orders] ❌ HTTP ${response.status}: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[Orders] ✅ Respuesta exitosa:", data);
    return data;

  } catch (err) {
    clearTimeout(timeoutId);
    const attemptNumber = retryCount + 1;
    
    // Detectar si fue timeout o error de conexión
    const isTimeout = err.name === "AbortError";
    const isNetworkError = !err.name; // Errores de red sin nombre específico
    
    if (isTimeout || isNetworkError) {
      console.warn(`[Orders] ⚠️ ${isTimeout ? "Timeout" : "Error de conexión"} en intento #${attemptNumber}`);
      
      // Reintentar siempre (sin límite real)
      if (retryCount < MAX_RETRIES) {
        const waitTime = Math.min(1000 * (retryCount + 1), 10000); // Espera progresiva: 1s, 2s, 3s... máx 10s
        console.log(`[Orders] ⏳ Esperando ${waitTime / 1000}s antes de reintentar... (${attemptNumber}/${MAX_RETRIES})`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return fetchWithTimeout(url, options, retryCount + 1);
      } else {
        // Si se agotaron los reintentos iniciales, hacer reintentos "infinitos"
        console.warn(`[Orders] 🔁 Agotados reintentos iniciales. Reintentando cada 15s indefinidamente...`);
        
        // Esperar 15 segundos y reintentar nuevamente
        await new Promise(resolve => setTimeout(resolve, 15000));
        return fetchWithTimeout(url, options, 0); // Reiniciar contador para mostrar bonito
      }
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

  console.log("[Orders] ✅ Botón encontrado, agregando listener...");

  // Usar addEventListener en lugar de onclick para evitar duplicados
  const handleOrderClick = async () => {
    console.log("[Orders] 🔘 Click detectado en botón");
    const target = document.getElementById("targetInput").value.trim();
    console.log(`[Orders] Input value: "${target}"`);

    // Validar que hay un objetivo
    if (!target) {
      console.warn("[Orders] ⚠️ Target vacío");
      alert("Debes ingresar un objetivo.");
      return;
    }

    // Validar que el usuario está autenticado
    const user = getCurrentUser();
    console.log(`[Orders] User from getCurrentUser: ${user ? user.email : "null"}`);
    if (!user) {
      console.warn("[Orders] ⚠️ Usuario no autenticado");
      alert("Debes iniciar sesión primero.");
      return;
    }

    try {
      console.log("\n[Orders] 🚀 ==================== NUEVA ORDEN ====================");
      console.log(`[Orders] Usuario: ${user.email}`);
      console.log(`[Orders] Objetivo: ${target}`);
      console.log(`[Orders] Backend: ${BACKEND_URL}`);
      console.log(`[Orders] Timeout por intento: ${TIMEOUT_MS / 1000 / 60} minutos`);
      console.log(`[Orders] Reintentos: ilimitados con espera progresiva`);

      // Obtener token de Firebase
      console.log("[Orders] 🔐 Obteniendo token de Firebase...");
      const idToken = await user.getIdToken();
      console.log("[Orders] ✅ Token obtenido");

      // Hacer petición al backend (con reintentos infinitos)
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
      alert(`Error: ${err.message}\n\nVerifica la consola (F12) para más detalles.`);
    } finally {
      console.log("[Orders] 🏁 ==================== FIN ====================\n");
    }
  };

  // Remover listeners anteriores para evitar duplicados
  btnCreateOrder.replaceWith(btnCreateOrder.cloneNode(true));
  const newBtn = document.getElementById("btn-create-order");
  newBtn.addEventListener("click", handleOrderClick);
  console.log("[Orders] ✅ Listener agregado al nuevo botón");
}