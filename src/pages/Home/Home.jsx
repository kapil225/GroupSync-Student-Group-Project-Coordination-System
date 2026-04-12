/**
 * Home.jsx — V1 with Auth
 * 
 * Projects overview page.
 * Now includes a "Join Project" modal where users
 * can enter a 6-character project code to join
 * an existing team project.
 */

import { useState } from 'react';
import { useGroup } from '../../context/GroupContext';
import GroupCard from '../../components/GroupCard/GroupCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Modal from '../../components/Modal/Modal';
import { UserPlus2 } from 'lucide-react';
import './Home.css';

export default function Home({ onNewGroup }) {
  const { state, dispatch } = useGroup();

  // Join Project modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const handleJoinProject = () => {
    const trimmedCode = joinCode.trim().toUpperCase();
    if (!trimmedCode) return;

    dispatch({ type: 'JOIN_GROUP', payload: { code: trimmedCode } });
    setJoinCode('');
    setShowJoinModal(false);
  };

  const projectCount = state.groups.length;

  return (
    <div className="home">

      {/* ── Header ── */}
      <div className="home__header">
        <div>
          <h1 className="home__title">Your Projects</h1>
          <p className="home__subtitle">{projectCount} project{projectCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="home__actions">
          <button className="home__join-btn" onClick={() => setShowJoinModal(true)}>
            <UserPlus2 size={15} />
            Join Project
          </button>
        </div>
      </div>

      {/* ── Projects Grid ── */}
      {projectCount > 0 ? (
        <div className="home__grid">
          {state.groups.map((group, index) => (
            <GroupCard key={group.id} group={group} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="◈"
          title="No projects yet"
          subtitle="Create a new project or join an existing one with a project code."
          action={
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="form-btn-primary" onClick={onNewGroup}>+ Create Project</button>
              <button
                className="form-btn-primary"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                onClick={() => setShowJoinModal(true)}
              >
                Join Project
              </button>
            </div>
          }
        />
      )}

      {/* ── Join Project Modal ── */}
      <Modal title="Join a Project" isOpen={showJoinModal} onClose={() => setShowJoinModal(false)}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          Ask your team lead for the 6-character project code, then paste it below.
        </p>
        <label className="form-label">Project Code</label>
        <input
          className="form-input"
          placeholder="e.g. ABC123"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleJoinProject()}
          maxLength={6}
          style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 18, textAlign: 'center' }}
          autoFocus
        />
        <button className="form-btn-primary" onClick={handleJoinProject}>
          Join Project
        </button>
      </Modal>
    </div>
  );
}
