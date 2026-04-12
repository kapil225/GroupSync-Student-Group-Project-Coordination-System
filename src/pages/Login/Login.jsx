/**
 * Login.jsx
 * 
 * The authentication page — shown when the user is not logged in.
 * 
 * Two tabs:
 *   1. LOGIN    — Email + password for existing users
 *   2. REGISTER — Name + email + password for new users
 * 
 * Plus a "Sign in with Google" button that works in both tabs.
 * 
 * On success, the user is redirected to the Home page automatically
 * (handled by AuthContext + ProtectedRoute).
 */

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function Login() {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  // Which tab is active?
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Error and loading state
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  /**
   * Handle form submission for both login and register.
   */
  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        // Log in with existing account
        if (!email || !password) {
          setError('Please fill in all fields.');
          return;
        }
        await loginWithEmail(email, password);

      } else {
        // Register a new account
        if (!name || !email || !password) {
          setError('Please fill in all fields.');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
        await registerWithEmail(email, password, name);
      }
    } catch (err) {
      // Translate Firebase error codes into friendly messages
      const errorMessages = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/weak-password': 'Password must be at least 6 characters.',
      };

      setError(errorMessages[err.code] || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Google sign-in.
   */
  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    }
  };


  return (
    <div className="login-page">
      <div className="login-card">

        {/* ── Logo ── */}
        <div className="login-card__logo">
          <span className="login-card__logo-icon">◈</span>
          <h1 className="login-card__logo-text">GroupSync</h1>
          <p className="login-card__tagline">Student Project Coordination</p>
        </div>

        {/* ── Tabs ── */}
        <div className="login-card__tabs">
          <button
            className={`login-card__tab ${activeTab === 'login' ? 'login-card__tab--active' : ''}`}
            onClick={() => { setActiveTab('login'); setError(''); }}
          >
            Login
          </button>
          <button
            className={`login-card__tab ${activeTab === 'register' ? 'login-card__tab--active' : ''}`}
            onClick={() => { setActiveTab('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {/* ── Error Message ── */}
        {error && (
          <div className="login-card__error">{error}</div>
        )}

        {/* ── Form ── */}
        <div className="login-card__form">
          {/* Name field (register only) */}
          {activeTab === 'register' && (
            <input
              className="login-card__input"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          )}

          <input
            className="login-card__input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus={activeTab === 'login'}
          />

          <input
            className="login-card__input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />

          <button
            className="login-card__submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Please wait...'
              : activeTab === 'login'
                ? 'Sign In'
                : 'Create Account'
            }
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="login-card__divider">
          <span>or</span>
        </div>

        {/* ── Google Sign-In ── */}
        <button className="login-card__google" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
