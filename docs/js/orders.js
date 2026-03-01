import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnGenerate = document.getElementById("btn-generate");

  btnGenerate.addEventListener("click", async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Debes iniciar sesión.");
      return;
    }

    const token = await user.getIdToken();

    const response = await fetch(`${window.BACKEND_URL}/orders/create`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "osint-report",
        timestamp: Date.now()
      })
    });

    const data = await response.json();

    if (!data.orderId) {
      alert("Error creando orden.");
      return;
    }

    window.location.href = `${window.BACKEND_URL}/pdf/${data.orderId}?token=${token}`;
  });
});