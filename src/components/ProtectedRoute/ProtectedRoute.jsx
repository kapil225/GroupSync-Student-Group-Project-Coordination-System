/**
 * ProtectedRoute.jsx
 * 
 * A wrapper that checks if the user is logged in.
 * If yes → render the children (the app).
 * If no  → show the Login page instead.
 * If checking → show a loading spinner.
 */

import { useAuth } from '../../context/AuthContext';
import Login from '../../pages/Login/Login';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking if there's a saved session
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-root)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
      }}>
        Loading...
      </div>
    );
  }

  // Not logged in → show login page
  if (!user) {
    return <Login />;
  }

  // Logged in → show the app
  return children;
}
