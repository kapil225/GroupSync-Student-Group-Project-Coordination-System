/**
 * firebase.js
 * 
 * Firebase initialization and service exports.
 * 
 * ┌──────────────────────────────────────────────────────┐
 * │  SETUP INSTRUCTIONS                                   │
 * │                                                       │
 * │  1. Go to https://console.firebase.google.com         │
 * │  2. Click "Create a project" (name it "groupsync")    │
 * │  3. Once created, click the web icon (</>)            │
 * │  4. Register your app (name: "groupsync")             │
 * │  5. Copy the firebaseConfig object and paste below    │
 * │                                                       │
 * │  Then enable Authentication:                          │
 * │  6. Go to Authentication → Sign-in method             │
 * │  7. Enable "Email/Password"                           │
 * │  8. Enable "Google" (select your email as support)    │
 * │                                                       │
 * │  Then enable Firestore:                               │
 * │  9. Go to Firestore Database → Create database        │
 * │  10. Start in "test mode" (for development)           │
 * │  11. Choose the nearest region                        │
 * └──────────────────────────────────────────────────────┘
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// ═══════════════════════════════════════════
// PASTE YOUR FIREBASE CONFIG BELOW
// Replace the placeholder values with your own
// from the Firebase Console.
// ═══════════════════════════════════════════

const firebaseConfig = {
  apiKey: "AIzaSyCc1KTY6C_T-emVe7F06EFg23o-8jyngSU",
  authDomain: "crud-f84ce.firebaseapp.com",
  projectId: "crud-f84ce",
  storageBucket: "crud-f84ce.firebasestorage.app",
  messagingSenderId: "301796359897",
  appId: "1:301796359897:web:b914c4bc31e6ee376bc8c8",
  measurementId: "G-ZL0E6G40EN"
};


// Initialize Firebase services
const app = initializeApp(firebaseConfig);

// Auth — handles login, registration, Google sign-in
export const auth = getAuth(app);

// Google Auth Provider — used for "Sign in with Google" button
export const googleProvider = new GoogleAuthProvider();

// Firestore — our database for storing projects, tasks, members
export const db = getFirestore(app);

export default app;
