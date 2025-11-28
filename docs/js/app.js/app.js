// --- FIREBASE AUTH (google) ---
const firebaseConfig = {
  apiKey: "AIzaSyD3a7cv735RQPYsXMdn4KWQ-NDugL7WyfI",
  authDomain: "studio-6473341422-75630.firebaseapp.com",
  projectId: "studio-6473341422-75630",
  storageBucket: "studio-6473341422-75630.firebasestorage.app",
  messagingSenderId: "240684953453",
  appId: "1:240684953453:web:6027f3b025c9ee22e8b464"
};

const btnGoogle  = document.getElementById("btn-google");
const btnLogout  = document.getElementById("btn-logout");
const authStatus = document.getElementById("auth-status");

function setAuthUI(user) {
  const ok = !!user;
  if (btnGoogle) btnGoogle.hidden = ok;
  if (btnLogout) btnLogout.hidden = !ok;
  if (authStatus) authStatus.textContent = ok ? (user.email || "sesión iniciada") : "no has iniciado sesión";
  if (typeof btnSearch !== "undefined" && btnSearch) btnSearch.disabled = !ok; // bloquea buscar si no hay login
}

let auth = null;
let provider = null;

try {
  if (typeof firebase !== "undefined") {
    if (!firebase.apps?.length) firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    provider = new firebase.auth.GoogleAuthProvider();

    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem("bauza_token", token);
      } else {
        localStorage.removeItem("bauza_token");
      }
      setAuthUI(user);
    });

    btnGoogle?.addEventListener("click", async () => {
      try { await auth.signInWithPopup(provider); }
      catch (e) { console.error(e); alert("login falló: " + (e?.message || e)); }
    });

    btnLogout?.addEventListener("click", async () => {
      try { await auth.signOut(); }
      catch (e) { console.error(e); }
    });
  } else {
    setAuthUI(null);
  }
} catch (e) {
  console.error("firebase init error:", e);
  setAuthUI(null);
}

// /docs/js/app.js
const API_BASE = "http://localhost:3000";

const qInput   = document.getElementById("dork-input");
const engineEl = document.getElementById("engine-select");
const btnSearch = document.getElementById("btn-search");
const resultsEl = document.getElementById("results");
const loadingEl = document.getElementById("loading");

function showLoading(show) {
  if (!loadingEl) return;
  if (show) {
    loadingEl.hidden = false;
  } else {
    loadingEl.hidden = true;
  }
}

function clearResults() {
  if (resultsEl) resultsEl.innerHTML = "";
}

function renderGoogleResults(data) {
  clearResults();
  if (!resultsEl) return;

  const items = data.items || [];
  if (!items.length) {
    resultsEl.innerHTML = "<p class='hint'>Sin resultados. Prueba afinando tu dork.</p>";
    return;
  }

  for (const item of items) {
    const card = document.createElement("article");
    card.className = "result-card";

    const title = document.createElement("a");
    title.className = "result-title";
    title.href = item.link;
    title.target = "_blank";
    title.rel = "noopener noreferrer";
    title.textContent = item.title || item.link || "Resultado";

    const link = document.createElement("div");
    link.className = "result-link";
    link.textContent = item.link || "";

    const snippet = document.createElement("div");
    snippet.className = "result-snippet";
    snippet.textContent = item.snippet || "";

    card.appendChild(title);
    card.appendChild(link);
    card.appendChild(snippet);

    resultsEl.appendChild(card);
  }
}

function renderShodanResults(data) {
  clearResults();
  if (!resultsEl) return;

  const matches = data.matches || [];
  if (!matches.length) {
    resultsEl.innerHTML = "<p class='hint'>Sin resultados en Shodan para esa consulta.</p>";
    return;
  }

  for (const m of matches) {
    const card = document.createElement("article");
    card.className = "result-card";

    const title = document.createElement("div");
    title.className = "result-title";
    title.textContent = `${m.ip_str || "IP desconocida"}:${m.port || ""}`;

    const meta = document.createElement("div");
    meta.className = "result-link";
    const parts = [];
    if (m.org) parts.push(m.org);
    if (m.location && m.location.country_name) {
      parts.push(m.location.country_name);
    }
    meta.textContent = parts.join(" • ") || "Sin metadata";

    const snippet = document.createElement("pre");
    snippet.className = "result-snippet";
    snippet.textContent = (m.data || "").slice(0, 800);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(snippet);

    resultsEl.appendChild(card);
  }
}

async function doSearch() {
  if (!qInput || !engineEl) return;

  const q = qInput.value.trim();
  const engine = engineEl.value;

  if (!q) {
    alert("Escribe un dork o término de búsqueda primero.");
    return;
  }

  showLoading(true);
  clearResults();

  try {
    let url;
    if (engine === "google") {
      url = `${API_BASE}/api/google?q=${encodeURIComponent(q)}`;
    } else {
      url = `${API_BASE}/api/shodan?query=${encodeURIComponent(q)}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      const msg = data?.error || "Error en la búsqueda";
      throw new Error(msg);
    }

    if (engine === "google") {
      renderGoogleResults(data);
    } else {
      renderShodanResults(data);
    }
  } catch (err) {
    console.error("Error al buscar:", err);
    clearResults();
    if (resultsEl) {
      resultsEl.innerHTML = `<p class="hint" style="color:#ff4d4f;">
        ${err.message || "Ocurrió un error al consultar el backend."}
      </p>`;
    }
  } finally {
    showLoading(false);
  }
}

// Eventos
if (btnSearch) {
  btnSearch.addEventListener("click", (e) => {
    e.preventDefault();
    doSearch();
  });
}

if (qInput) {
  qInput.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.keyCode === 13) && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      doSearch();
    }
  });
}
