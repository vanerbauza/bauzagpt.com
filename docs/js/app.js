// app.js
import { setToken, getToken, clearToken, isLoggedIn } from "./session.js";
console.log("app.js loaded");

const API_BASE = "http://localhost:8080";

const loginDiv = document.getElementById("login");
const appDiv = document.getElementById("app");

const targetInput = document.getElementById("target");
const createOrderBtn = document.getElementById("createOrder");
const logoutBtn = document.getElementById("logout");

// ---- UI helpers
function showLoggedIn() {
  loginDiv.style.display = "none";
  appDiv.style.display = "block";
}

function showLoggedOut() {
  loginDiv.style.display = "block";
  appDiv.style.display = "none";
}

// ---- Restore session
if (isLoggedIn()) {
  showLoggedIn();
} else {
  showLoggedOut();
}

import { setToken } from "./session.js";

window.handleGoogleLogin = async function (response) {
  console.log("[GSI] credential received");

  const res = await fetch("http://localhost:8080/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential: response.credential })
  });

  if (!res.ok) {
    console.error("Login backend error");
    alert("Login fallido");
    return;
  }

  const data = await res.json();
  localStorage.setItem("bauza_token", data.token);

  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";

  console.log("[AUTH] token stored");
};




// ---- Create order
createOrderBtn.addEventListener("click", async () => {
  const token = getToken();
  if (!token) {
    alert("Sesión requerida");
    showLoggedOut();
    return;
  }

  const target = targetInput.value.trim();
  if (!target) {
    alert("Target requerido");
    return;
  }

  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ target })
  });

  if (res.status === 401) {
    clearToken();
    alert("Sesión expirada");
    showLoggedOut();
    return;
  }

  if (!res.ok) {
    alert("Error creando orden");
    return;
  }

  const data = await res.json();
  window.location.href = data.checkoutUrl;
});

// ---- Logout
logoutBtn.addEventListener("click", () => {
  clearToken();
  showLoggedOut();
});
