// js/main.js
import { loginWithGoogle, logout, watchAuthState, getStoredToken } from "./firebase.js";
import { createOrder } from "./api.js";

const $ = (s) => document.querySelector(s);

function setStatus(text) {
  $("#status").textContent = text;
}

function setAuthed(user) {
  $("#loginBtn").classList.toggle("hidden", !!user);
  $("#logoutBtn").classList.toggle("hidden", !user);
  $("#userPill").classList.toggle("hidden", !user);
  $("#userEmail").textContent = user?.email || user?.uid || "";
}

async function onLogin() {
  try {
    setStatus("Iniciando sesión...");
    const user = await loginWithGoogle();
    setAuthed(user);
    setStatus("Sesión lista.");
  } catch (e) {
    console.error(e);
    setStatus("No se pudo iniciar sesión.");
    alert("No se pudo iniciar sesión con Google.");
  }
}

async function onLogout() {
  try {
    await logout();
    setAuthed(null);
    setStatus("Sesión cerrada.");
  } catch (e) {
    console.error(e);
    alert("No se pudo cerrar sesión.");
  }
}

async function onStart() {
  try {
    if (!getStoredToken()) {
      alert("Inicia sesión primero.");
      return;
    }

    const target = $("#target").value.trim();
    if (!target) {
      alert("Ingresa un target.");
      return;
    }

    $("#searchBtn").disabled = true;
    setStatus("Creando orden...");

    const data = await createOrder(target);

    if (!data?.checkoutUrl || !data?.orderId) {
      throw new Error("checkout_init_failed");
    }

    localStorage.setItem("lastOrderId", data.orderId);
    setStatus("Redirigiendo a Stripe Checkout...");
    location.href = data.checkoutUrl;
  } catch (e) {
    console.error(e);
    setStatus("Error al iniciar pago.");
    alert(`No se pudo iniciar el pago. (${e.message})`);
  } finally {
    $("#searchBtn").disabled = false;
  }
}

function boot() {
  $("#loginBtn").addEventListener("click", onLogin);
  $("#logoutBtn").addEventListener("click", onLogout);
  $("#searchBtn").addEventListener("click", onStart);

  watchAuthState((user) => {
    setAuthed(user);
    setStatus(user ? "Sesión activa." : "Inicia sesión para continuar.");
  });
}

boot();
