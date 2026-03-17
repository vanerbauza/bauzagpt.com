// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const appConfig = window.APP_CONFIG_PROMISE
  ? await window.APP_CONFIG_PROMISE
  : null;

const firebaseConfig = appConfig?.FIREBASE_CONFIG || window.FIREBASE_CONFIG;

if (!firebaseConfig) {
  throw new Error("FIREBASE_CONFIG no disponible en config.json");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
