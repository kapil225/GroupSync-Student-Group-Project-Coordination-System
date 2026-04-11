/* ═══════════════════════════════════════════
   App — Root Layout & Routing
   ═══════════════════════════════════════════ */

import { useState } from 'react';
import { GroupProvider, useGroup } from './context/GroupContext';
import Sidebar from './components/Sidebar/Sidebar';
import Modal from './components/Modal/Modal';
import Home from './pages/Home/Home';
import ProjectBoard from './pages/ProjectBoard/ProjectBoard';
import './App.css';

function AppLayout() {
  const { state, dispatch } = useGroup();
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    dispatch({ type: 'CREATE_GROUP', payload: { name: groupName.trim() } });
    setGroupName('');
    setShowNewGroup(false);
  };

  return (
    <div className="app">
      <Sidebar onNewGroup={() => setShowNewGroup(true)} />

      <main className="app__main">
        {state.view === 'home' && (
          <Home onNewGroup={() => setShowNewGroup(true)} />
        )}
        {state.view === 'project' && <ProjectBoard />}
      </main>

      {/* ── New Project Modal ── */}
      <Modal
        title="Create New Project"
        isOpen={showNewGroup}
        onClose={() => setShowNewGroup(false)}
      >
        <label className="form-label">Project Name</label>
        <input
          className="form-input"
          placeholder="e.g. CS101 Final Project"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
          autoFocus
        />
        <button className="form-btn-primary" onClick={handleCreateGroup}>
          Create Project
        </button>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <GroupProvider>
      <AppLayout />
    </GroupProvider>
  );
}
