// js/api.js
import { BACKEND } from "./config.js";
import { getStoredToken } from "./firebase.js";

async function apiFetch(path, { method = "GET", body = null, headers = {} } = {}) {
  const token = getStoredToken();
  if (!token) throw new Error("auth_required");

  const res = await fetch(`${BACKEND}${path}`, {
    method,
    headers: {
      "Content-Type": body ? "application/json" : undefined,
      "Authorization": `Bearer ${token}`,
      ...headers
    },
    body: body ? JSON.stringify(body) : null
  });

  // Intenta parsear JSON si aplica
  const ct = res.headers.get("content-type") || "";
  const payload = ct.includes("application/json") ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const code = payload?.error || `http_${res.status}`;
    const err = new Error(code);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

export async function createOrder(target) {
  return apiFetch("/api/orders", { method: "POST", body: { target } });
}

export async function downloadPdf(orderId) {
  const token = getStoredToken();
  const res = await fetch(`${BACKEND}/api/orders/${orderId}/pdf`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("pdf_not_ready");
  return await res.blob();
}
