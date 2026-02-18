/**
 * success.js - Página de éxito después del pago
 * Muestra estado del procesamiento del OSINT job
 */

const statusDiv = document.getElementById('status');
const sessionId = new URLSearchParams(window.location.search).get('session_id');

if (!sessionId) {
  statusDiv.textContent = '❌ Error: No se encontró el ID de sesión. Por favor vuelve a intentar.';
} else {
  statusDiv.textContent = `✅ Pago completado. Procesando tu informe OSINT... (Session: ${sessionId.substring(0, 10)}...)`;
  
  // Polls backend para ver si el job está listo
  const checkStatus = async () => {
    try {
      // Aquí iría la lógica para consultar el estado del job
      // Por ahora solo mostramos un mensaje genérico
      statusDiv.innerHTML = `
        <p>✅ Pago procesado correctamente.</p>
        <p>Tu informe OSINT está siendo generado...</p>
        <p>Te notificaremos por correo cuando esté listo.</p>
      `;
    } catch (err) {
      console.error('[Success] Error:', err);
      statusDiv.textContent = '❌ Error al procesar el pago.';
    }
  };
  
  checkStatus();
}
