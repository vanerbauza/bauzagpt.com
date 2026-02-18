// 1. Leer session_id de la URL
const params = new URLSearchParams(window.location.search);
const sessionId = params.get("session_id");

if (!sessionId) {
    document.getElementById("status").innerText =
        "Error: no se encontró el ID de sesión.";
    throw new Error("Missing session_id");
}

// 2. Validar la sesión con el backend
async function validateSession() {
    try {
        const res = await fetch(`https://bauzagpt-backend.fly.dev/api/stripe/session/${sessionId}`);
        const data = await res.json();

        if (!data || !data.orderId) {
            document.getElementById("status").innerText =
                "Error validando la sesión.";
            return;
        }

        window.orderId = data.orderId;
        document.getElementById("status").innerText =
            "Pago recibido. Generando informe…";

        // Iniciar polling
        setTimeout(checkPDF, 6000);

    } catch (err) {
        document.getElementById("status").innerText =
            "Error comunicando con el servidor.";
    }
}

// 3. Revisar si el PDF ya está listo
async function checkPDF() {
    try {
        const res = await fetch(`/api/orders/${window.orderId}`);
        const data = await res.json();

        if (data.status === "ready") {
            document.getElementById("status").innerText =
                "Informe listo para descargar.";
            const link = document.getElementById("download");
            link.href = `/api/orders/${window.orderId}/pdf`;
            link.style.display = "block";
            return;
        }

        // Si no está listo, volver a intentar
        setTimeout(checkPDF, 6000);

    } catch (err) {
        document.getElementById("status").innerText =
            "Error verificando el informe.";
    }
}

validateSession();