/**
 * AuthContext.jsx
 * 
 * Handles all authentication logic:
 *   - Email/password registration (sign up)
 *   - Email/password login (sign in)
 *   - Google sign-in (one-click)
 *   - Sign out
 *   - Track the current user across the app
 * 
 * HOW IT WORKS:
 *   Firebase handles the heavy lifting. We just call its methods
 *   and listen for auth state changes. When a user logs in or out,
 *   Firebase fires onAuthStateChanged, and we update our React state.
 * 
 * USAGE:
 *   const { user, loginWithGoogle, logout } = useAuth();
 *   if (user) console.log("Logged in as", user.email);
 */

import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  // The currently logged-in user (null = not logged in)
  const [user, setUser] = useState(null);

  // True while we're checking if there's a saved session
  const [loading, setLoading] = useState(true);


  /* ─────────────────────────────────────────────
     LISTEN FOR AUTH CHANGES
     
     Firebase remembers the user's session. When the app
     loads, this listener fires with the saved user (if any).
     It also fires on login/logout.
     ───────────────────────────────────────────── */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);   // Done checking — we know if they're logged in or not
    });

    // Cleanup: stop listening when the component unmounts
    return () => unsubscribe();
  }, []);


  /* ─────────────────────────────────────────────
     AUTH METHODS
     ───────────────────────────────────────────── */

  /**
   * Register a new account with email and password.
   * Also sets their display name so we can show it in the UI.
   */
  const registerWithEmail = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Set the user's display name (Firebase doesn't do this automatically)
    await updateProfile(result.user, { displayName: displayName });

    // Force refresh so the displayName is available immediately
    setUser({ ...result.user, displayName: displayName });

    return result.user;
  };

  /**
   * Log in with an existing email and password.
   */
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  /**
   * Sign in with Google (opens a popup window).
   * The user picks their Google account and they're logged in.
   * Display name and email come from their Google profile.
   */
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  /**
   * Log the user out and clear the session.
   */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };


  /* ─────────────────────────────────────────────
     PROVIDE TO CHILDREN
     ───────────────────────────────────────────── */

  const value = {
    user,                 // Current user object (or null)
    loading,              // True while checking session
    registerWithEmail,    // (email, password, name) => Promise
    loginWithEmail,       // (email, password) => Promise
    loginWithGoogle,      // () => Promise
    logout,               // () => Promise
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


/**
 * useAuth() — access auth state and methods from any component.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() must be called inside <AuthProvider>.');
  }
  return context;
}
