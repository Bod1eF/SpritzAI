// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// Optional: if you want analytics
// import { getAnalytics } from "firebase/analytics";

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfApD2I6NXgSaNkNChIZzgh_ch3_gKhjQ",
  authDomain: "cruzhacks2025-spritz.firebaseapp.com",
  projectId: "cruzhacks2025-spritz",
  storageBucket: "cruzhacks2025-spritz.firebasestorage.app",
  messagingSenderId: "84652651695",
  appId: "1:84652651695:web:1bcde3e9f36826b04f505a",
  measurementId: "G-ENCNJWJV7S"
};

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optional analytics (can remove if not needed)
// const analytics = getAnalytics(app);

// Auth setup
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };