// success-v2.js

// 1. Leer session_id de la URL
const params = new URLSearchParams(window.location.search);
const sessionId = params.get("session_id");

const statusEl = document.getElementById("status");
const downloadLink = document.getElementById("download");

// Validar que config.json ya cargó
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

if (!sessionId) {
    statusEl.innerText = "Error: no se encontró el ID de sesión.";
    throw new Error("Missing session_id");
}

// 2. Validar la sesión con el backend (solo session_id, sin JWT)
async function validateSession() {
    try {
        const BACKEND = window.__CONFIG.BACKEND_URL;

        const res = await fetch(`${BACKEND}/api/stripe/session/${sessionId}`);

        if (!res.ok) {
            statusEl.innerText = "Error validando la sesión.";
            console.error("Error en /api/stripe/session:", res.status);
            return;
        }

        const data = await res.json();

        if (!data || !data.orderId) {
            statusEl.innerText = "Error validando la sesión.";
            console.error("Respuesta inválida de /api/stripe/session:", data);
            return;
        }

        // Guardamos el orderId globalmente para el polling
        window.orderId = data.orderId;

        statusEl.innerText = "Pago recibido. Generando informe…";

        // Iniciar polling después de un pequeño delay
        setTimeout(checkPDF, 6000);

    } catch (err) {
        console.error("Error comunicando con el servidor en validateSession:", err);
        statusEl.innerText = "Error comunicando con el servidor.";
    }
}

// 3. Revisar periódicamente si el PDF ya está listo (sin JWT)
async function checkPDF() {
    try {
        const BACKEND = window.__CONFIG.BACKEND_URL;

        if (!window.orderId) {
            console.error("orderId no definido antes de checkPDF");
            statusEl.innerText = "Error verificando el informe.";
            return;
        }

        const res = await fetch(`${BACKEND}/api/orders/${window.orderId}`);

        if (!res.ok) {
            console.error("Error en /api/orders/:id:", res.status);
            statusEl.innerText = "Error verificando el informe.";
            setTimeout(checkPDF, 6000);
            return;
        }

        const data = await res.json();

        if (data.status === "ready") {
            statusEl.innerText = "Informe listo para descargar.";

            downloadLink.href = `${BACKEND}/api/orders/${window.orderId}/pdf`;
            downloadLink.style.display = "block";
            return;
        }

        statusEl.innerText = "Generando informe…";
        setTimeout(checkPDF, 6000);

    } catch (err) {
        console.error("Error verificando el informe en checkPDF:", err);
        statusEl.innerText = "Error verificando el informe.";
        setTimeout(checkPDF, 6000);
    }
}

// 4. Iniciar flujo cuando config.json esté listo
waitForConfig().then(validateSession);
