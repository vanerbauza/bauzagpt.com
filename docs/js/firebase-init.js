// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOCMW1UIG760RRWVUCdmIUs3HnOaD7Se0",
  authDomain: "bauzagpt-fbdca.firebaseapp.com",
  projectId: "bauzagpt-fbdca",
  storageBucket: "bauzagpt-fbdca.firebasestorage.app",
  messagingSenderId: "766060384370",
  appId: "1:766060384370:web:fc19c978fe43be4e86b2eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();