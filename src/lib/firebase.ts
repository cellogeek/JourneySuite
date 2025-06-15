
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRr0TJMnbbYgZO8u4VWgLmw5-oqu5Plsc",
  authDomain: "journey-suite.firebaseapp.com",
  projectId: "journey-suite",
  storageBucket: "journey-suite.appspot.com", // Corrected from .firebasestorage.app to .appspot.com
  messagingSenderId: "130642270887",
  appId: "1:130642270887:web:01fa28fed8112351b75982",
  measurementId: "G-0V4SW94QL9"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
