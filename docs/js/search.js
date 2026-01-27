(() => {
  const q = document.getElementById("q");
  const engine = document.getElementById("engine");
  const msg = document.getElementById("msg");

  const btnGo = document.getElementById("go");
  const btnCopy = document.getElementById("copy");
  const btnClear = document.getElementById("clear");

  const openGoogle = (query) =>
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");

  const openShodan = (query) =>
    window.open(`https://www.shodan.io/search?query=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");

  const flash = (t) => { msg.textContent = t; };

  function run() {
    const query = (q.value || "").trim();
    if (!query) return flash("pon un dork primero.");

    const e = engine.value;
    if (e === "google") openGoogle(query);
    if (e === "shodan") openShodan(query);
    if (e === "both") { openGoogle(query); openShodan(query); }

    flash("listo: resultados abiertos.");
  }

  btnGo.addEventListener("click", run);
  q.addEventListener("keydown", (ev) => { if (ev.key === "Enter") run(); });

  btnCopy.addEventListener("click", async () => {
    const text = (q.value || "").trim();
    if (!text) return flash("nada que copiar.");
    await navigator.clipboard.writeText(text);
    flash("copiado.");
  });

  btnClear.addEventListener("click", () => {
    q.value = "";
    q.focus();
    flash("limpio.");
  });
})();
