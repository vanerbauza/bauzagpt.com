// js/config.js
export const BACKEND =
  (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8080"
    : "https://bauzagpt-backend.onrender.com";

// Pega aquí tu config Web de Firebase (Firebase Console -> Project settings -> Your apps -> Config)
export const FIREBASE_CONFIG = {
  apiKey: "REEMPLAZA",
  authDomain: "REEMPLAZA",
  projectId: "REEMPLAZA",
  appId: "REEMPLAZA",
};
