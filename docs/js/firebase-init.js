// docs/js/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// pega tu config real aquí
const firebaseConfig = {
  apiKey: "pon_aqui",
  authDomain: "pon_aqui",
  projectId: "pon_aqui",
  appId: "pon_aqui",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
