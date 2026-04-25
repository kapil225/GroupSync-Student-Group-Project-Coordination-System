/**
 * AuthContext.jsx — V4
 * Same as V3. Saves users to Firestore with roles.
 * First user = Super Admin, all others = Member.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { ROLES } from '../utils/helpers';

const AuthContext = createContext(null);

async function saveUserToFirestore(firebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await updateDoc(userRef, { lastLogin: serverTimestamp() });
    return userSnap.data().role;
  }

  const usersSnap = await getDocs(collection(db, 'users'));
  const isFirst = usersSnap.empty;

  const userData = {
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL || null,
    role: isFirst ? ROLES.SUPER_ADMIN : ROLES.MEMBER,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  };

  await setDoc(userRef, userData);
  return userData.role;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (fu) {
        try {
          const role = await saveUserToFirestore(fu);
          setUser(fu); setUserRole(role);
        } catch (e) { console.error(e); setUser(fu); setUserRole(ROLES.MEMBER); }
      } else { setUser(null); setUserRole(null); }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const registerWithEmail = async (email, password, displayName) => {
    const r = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(r.user, { displayName });
    const role = await saveUserToFirestore({ ...r.user, displayName });
    setUser({ ...r.user, displayName }); setUserRole(role);
    return r.user;
  };

  const loginWithEmail = async (email, password) => {
    const r = await signInWithEmailAndPassword(auth, email, password);
    const role = await saveUserToFirestore(r.user);
    setUserRole(role); return r.user;
  };

  const loginWithGoogle = async () => {
    const r = await signInWithPopup(auth, googleProvider);
    const role = await saveUserToFirestore(r.user);
    setUserRole(role); return r.user;
  };

  const logout = async () => { await signOut(auth); setUser(null); setUserRole(null); };

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
