// /docs/js/login.js
import { auth } from "./firebase-init.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

const $ = (id) => document.getElementById(id);
const msgBox = $("login-messages");

function showMsg(text, type = "info") {
  if (!msgBox) return;
  msgBox.textContent = text;
  msgBox.style.marginTop = "1rem";
  msgBox.style.fontSize = "0.9rem";
  msgBox.style.color = type === "error" ? "#ff4d4f" : "#00e676";
  console.log("[LOGIN]", text);
}


window.bauzaLoginGoogle = async () => {
  showMsg("Abriendo Google…");

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("Google OK:", user);
    showMsg(`Bienvenido, ${user.displayName || user.email}`, "ok");

    // redirigir al dashboard
    // window.location.href = "/dashboard.html";
  } catch (err) {
    console.error("Error Google:", err);
    showMsg(err.message || "Error al iniciar sesión con Google", "error");
  }
};

let smsConfirmation = null;

// reCAPTCHA se engancha a un elemento con id="btn-sms"
window.recaptchaVerifier = new RecaptchaVerifier(
  "btn-sms",
  {
    size: "invisible",
    callback: (response) => {
      console.log("reCAPTCHA OK", response);
    },
  },
  auth
);

window.bauzaSendCode = async () => {
  const phoneInput = $("phone-input");
  const phoneNumber = phoneInput?.value.trim();

  if (!phoneNumber) {
    showMsg("Escribe un número en formato +52...", "error");
    return;
  }

  showMsg("Enviando SMS…");

  try {
    smsConfirmation = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );

    showMsg(
      "SMS enviado. Revisa tu teléfono. (En pruebas usa un número de prueba de Firebase)",
      "ok"
    );

    const code = window.prompt("Introduce el código que te llegó por SMS:");
    if (!code) {
      showMsg("No se ingresó código", "error");
      return;
    }

    const result = await smsConfirmation.confirm(code);
    console.log("SMS OK:", result.user);
    showMsg("Teléfono verificado. Bienvenido.", "ok");
  } catch (err) {
    console.error("Error SMS:", err);
    showMsg(err.message || "Error al enviar o verificar el SMS", "error");
  }
};
