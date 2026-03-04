import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBaHoDEcL8ZjVoJJiTbcSZGAiKJJgfmfZc",
  authDomain: "bauzagpt.com",
  projectId: "bauzagpt-fbdca",
  storageBucket: "bauzagpt-fbdca.firebasestorage.app",
  messagingSenderId: "766060384370",
  appId: "1:766060384370:web:fc19c978fe43be4e86b2eb"
};

const app = initializeApp(firebaseConfig);

// Resolver correcto para popups SIN Firebase Hosting
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver
});

export const provider = new GoogleAuthProvider();
