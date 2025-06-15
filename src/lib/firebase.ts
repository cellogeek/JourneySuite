
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// IMPORTANT: Ensure your Firebase project's API key and other details are correct.
const firebaseConfig = {
  apiKey: "AIzaSyCRr0TJMnbbYgZO8u4VWgLmw5-oqu5Plsc",
  authDomain: "journey-suite.firebaseapp.com",
  projectId: "journey-suite",
  storageBucket: "journey-suite.appspot.com", // Corrected to .appspot.com
  messagingSenderId: "130642270887",
  appId: "1:130642270887:web:01fa28fed8112351b75982",
  measurementId: "G-0V4SW94QL9"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized for the first time.");
} else {
  app = getApp();
  console.log("Firebase app re-initialized or already exists.");
}

const auth = getAuth(app);
const db = getFirestore(app);

// REMINDER for Firebase Authentication (e.g., Google Sign-In):
// If you encounter an 'auth/unauthorized-domain' error, you MUST add
// your application's domain to the list of "Authorized domains" in your
// Firebase project console:
// Firebase Console -> Authentication -> Sign-in method -> Authorized domains.
// For Firebase Studio dev preview or other hosted dev environments, this will
// be the domain shown in your browser's address bar (e.g., 
// 'your-project.web.app' or 'port-number-project-hash.cluster-id.cloudworkstations.dev').

export { app, auth, db };

