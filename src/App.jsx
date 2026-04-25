import { useState } from 'react';
import { GroupProvider, useGroup } from './context/GroupContext';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Sidebar from './components/Sidebar/Sidebar';
import Modal from './components/Modal/Modal';
import Home from './pages/Home/Home';
import ProjectBoard from './pages/ProjectBoard/ProjectBoard';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AuditLog from './pages/AuditLog/AuditLog';
import './App.css';

function AppLayout() {
  const { state, dispatch } = useGroup();
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const handleCreateGroup = () => { if (!newGroupName.trim()) return; dispatch({ type: 'CREATE_GROUP', payload: { name: newGroupName.trim() } }); setNewGroupName(''); setShowNewGroupModal(false); };
  const handleJoinGroup = () => { const c = joinCode.trim().toUpperCase(); if (!c) return; dispatch({ type: 'JOIN_GROUP', payload: { code: c } }); setJoinCode(''); setShowJoinModal(false); };

  return (
    <div className="app">
      <Sidebar onNewGroup={() => setShowNewGroupModal(true)} onJoinGroup={() => setShowJoinModal(true)} />
      <main className="app__main">
        {state.view === 'home' && <Home onNewGroup={() => setShowNewGroupModal(true)} />}
        {state.view === 'board' && <ProjectBoard />}
        {state.view === 'dashboard' && <Dashboard />}
        {state.view === 'admin' && <AdminDashboard />}
        {state.view === 'audit' && <AuditLog />}
      </main>

      <Modal title="Create New Project" isOpen={showNewGroupModal} onClose={() => setShowNewGroupModal(false)}>
        <label className="form-label">Project Name</label>
        <input className="form-input" placeholder="e.g. CS101 Final Project" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()} autoFocus />
        <button className="form-btn-primary" onClick={handleCreateGroup}>Create Project</button>
      </Modal>

      <Modal title="Join a Project" isOpen={showJoinModal} onClose={() => setShowJoinModal(false)}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Enter the 6-character code from your team lead.</p>
        <label className="form-label">Project Code</label>
        <input className="form-input" placeholder="e.g. ABC123" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleJoinGroup()} maxLength={6} style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 18, textAlign: 'center' }} autoFocus />
        <button className="form-btn-primary" onClick={handleJoinGroup}>Join Project</button>
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
