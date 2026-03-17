// Carga dinámica de configuración desde config.json
window.APP_CONFIG_PROMISE = (async () => {
  try {
    const response = await fetch("./config.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      console.error("❌ No se pudo cargar config.json:", response.status);
      return null;
    }

    const config = await response.json();

    // Variables globales accesibles desde cualquier script
    window.BACKEND_URL = config.BACKEND_URL || "";
    window.STRIPE_PUBLIC_KEY = config.STRIPE_PUBLIC_KEY || "";
    window.ENVIRONMENT = config.ENVIRONMENT || "production";
    window.FIREBASE_CONFIG = config.FIREBASE_CONFIG || null;

    console.log("✔ Configuración cargada:", config);

    return config;
  } catch (error) {
    console.error("❌ Error cargando config.json:", error);
    return null;
  }
})();
