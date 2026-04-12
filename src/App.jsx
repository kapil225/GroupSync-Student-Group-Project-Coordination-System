/**
 * App.jsx — V1 with Firebase Auth
 * 
 * Root component. Wraps everything in:
 *   1. AuthProvider (in main.jsx) — handles login state
 *   2. ProtectedRoute — redirects to Login if not authenticated
 *   3. GroupProvider — manages project data via Firestore
 */

import { useState } from 'react';
import { GroupProvider, useGroup } from './context/GroupContext';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Sidebar from './components/Sidebar/Sidebar';
import Modal from './components/Modal/Modal';
import Home from './pages/Home/Home';
import ProjectBoard from './pages/ProjectBoard/ProjectBoard';
import './App.css';


function AppLayout() {
  const { state, dispatch } = useGroup();

  // "New Project" modal
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  // "Join Project" modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const handleCreateGroup = () => {
    const trimmedName = newGroupName.trim();
    if (!trimmedName) return;
    dispatch({ type: 'CREATE_GROUP', payload: { name: trimmedName } });
    setNewGroupName('');
    setShowNewGroupModal(false);
  };

  const handleJoinGroup = () => {
    const trimmedCode = joinCode.trim().toUpperCase();
    if (!trimmedCode) return;
    dispatch({ type: 'JOIN_GROUP', payload: { code: trimmedCode } });
    setJoinCode('');
    setShowJoinModal(false);
  };

  return (
    <div className="app">
      <Sidebar
        onNewGroup={() => setShowNewGroupModal(true)}
        onJoinGroup={() => setShowJoinModal(true)}
      />

      <main className="app__main">
        {state.view === 'home' && (
          <Home onNewGroup={() => setShowNewGroupModal(true)} />
        )}
        {state.view === 'project' && <ProjectBoard />}
      </main>

      {/* New Project Modal */}
      <Modal
        title="Create New Project"
        isOpen={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
      >
        <label className="form-label">Project Name</label>
        <input
          className="form-input"
          placeholder="e.g. CS101 Final Project"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
          autoFocus
        />
        <button className="form-btn-primary" onClick={handleCreateGroup}>
          Create Project
        </button>
      </Modal>

      {/* Join Project Modal */}
      <Modal
        title="Join a Project"
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      >
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Enter the 6-character code from your team lead.
        </p>
        <label className="form-label">Project Code</label>
        <input
          className="form-input"
          placeholder="e.g. ABC123"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleJoinGroup()}
          maxLength={6}
          style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 18, textAlign: 'center' }}
          autoFocus
        />
        <button className="form-btn-primary" onClick={handleJoinGroup}>
          Join Project
        </button>
      </Modal>
    </div>
  );
}


export default function App() {
  return (
    <ProtectedRoute>
      <GroupProvider>
        <AppLayout />
      </GroupProvider>
    </ProtectedRoute>
  );
}
