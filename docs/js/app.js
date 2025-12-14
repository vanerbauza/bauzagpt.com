// app.js — LIMPIO, SIN ERRORES
document.addEventListener("DOMContentLoaded", () => {
  const q = document.getElementById("q");
  const btnPremium = document.getElementById("btn-premium");
  const status = document.getElementById("status");

  if (!btnPremium) return;

  async function runPremiumSearch() {
    const query = (q?.value || "").trim();
    if (!query) {
      if (status) status.textContent = "pon un objetivo primero.";
      return;
    }
    if (status) status.textContent = "buscando…";
    console.log("Premium search placeholder:", query);
  }

  btnPremium.addEventListener("click", runPremiumSearch);

  if (q) {
    q.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runPremiumSearch();
    });
  }
});
