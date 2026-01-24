
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBaHoDEcL8ZjVoJJiTbcSZGAiKJJgfmfZc",
  authDomain: "bauzagpt-fbdca.firebaseapp.com",
  projectId: "bauzagpt-fbdca",
  storageBucket: "bauzagpt-fbdca.firebasestorage.app",
  messagingSenderId: "766060384370",
  appId: "1:766060384370:web:fc19c978fe43be4e86b2eb"
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
