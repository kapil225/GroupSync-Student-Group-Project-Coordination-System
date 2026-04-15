/**
 * AuthContext.jsx — V3
 * 
 * V3: When a user registers/logs in, their profile is saved to
 * Firestore 'users' collection. This allows the Super Admin to
 * see all users in the system.
 * 
 * Firestore 'users/{uid}':
 *   { displayName, email, photoURL, role, createdAt, lastLogin }
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { ROLES } from '../utils/helpers';

const AuthContext = createContext(null);

/**
 * Save or update user profile in Firestore.
 * First user becomes SUPER_ADMIN, all others are MEMBER.
 */
async function saveUserToFirestore(firebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // Existing user — update last login
    await updateDoc(userRef, { lastLogin: serverTimestamp() });
    return userSnap.data().role;
  } else {
    // New user — check if this is the FIRST user in the system
    const { getDocs, collection } = await import('firebase/firestore');
    const usersSnap = await getDocs(collection(db, 'users'));
    const isFirstUser = usersSnap.empty;

    const userData = {
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || null,
      role: isFirstUser ? ROLES.SUPER_ADMIN : ROLES.MEMBER,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };

    await setDoc(userRef, userData);
    return userData.role;
  }
}


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const role = await saveUserToFirestore(firebaseUser);
          setUser(firebaseUser);
          setUserRole(role);
        } catch (e) {
          console.error('Error saving user:', e);
          setUser(firebaseUser);
          setUserRole(ROLES.MEMBER);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const registerWithEmail = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    const role = await saveUserToFirestore({ ...result.user, displayName });
    setUser({ ...result.user, displayName });
    setUserRole(role);
    return result.user;
  };

  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const role = await saveUserToFirestore(result.user);
    setUserRole(role);
    return result.user;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const role = await saveUserToFirestore(result.user);
    setUserRole(role);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, registerWithEmail, loginWithEmail, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth needs AuthProvider');
  return c;
}
