import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// FINAL PRODUCTION FIREBASE CONFIG (tutor-bg)
const firebaseConfig = {
    apiKey: "AIzaSyD_4TAAGGyW3va0aRM-M8cDTWEmZVC6BXU",
    authDomain: "tutor-bg.firebaseapp.com",
    projectId: "tutor-bg",
    storageBucket: "tutor-bg.firebasestorage.app",
    messagingSenderId: "951951645484",
    appId: "1:951951645484:web:2e39f3af8af3863265aa89",
    measurementId: "G-MENZERDMVP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Bypass potential ERR_BLOCKED_BY_CLIENT
});
export const googleProvider = new GoogleAuthProvider();
