// Carga dinámica de configuración desde config.json
(async () => {
  try {
    const response = await fetch("./config.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      console.error("❌ No se pudo cargar config.json:", response.status);
      return;
    }

    const config = await response.json();

    // Variables globales accesibles desde cualquier script
    window.BACKEND_URL = config.BACKEND_URL || "";
    window.STRIPE_PUBLIC_KEY = config.STRIPE_PUBLIC_KEY || "";
    window.ENVIRONMENT = config.ENVIRONMENT || "production";

    console.log("✔ Configuración cargada:", config);

  } catch (error) {
    console.error("❌ Error cargando config.json:", error);
  }
})();