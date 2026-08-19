import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ── PASTE YOUR FIREBASE CONFIG HERE ──────────────────────────
// Get this from Firebase Console → Project Settings → Your Apps
const firebaseConfig = {
  apiKey: "AIzaSyCEiDtAob3_7xoAJcHkRhluP10i4W01luw",
  authDomain: "truthlens-3696e.firebaseapp.com",
  projectId: "truthlens-3696e",
  storageBucket: "truthlens-3696e.firebasestorage.app",
  messagingSenderId: "639011294030",
  appId: "1:639011294030:web:3208777cf3faf123a7ec1f"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");
googleProvider.setCustomParameters({
  prompt: "select_account",   // always show account picker
});

export default app;