/* ═══════════════════════════════════════════
   Sidebar — Navigation & Group List
   ═══════════════════════════════════════════ */

import { useGroup } from '../../context/GroupContext';
import { Users, FolderOpen, Plus } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ onNewGroup }) {
  const { state, dispatch } = useGroup();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo" onClick={() => dispatch({ type: 'NAVIGATE_HOME' })}>
        <span className="sidebar__logo-icon">◈</span>
        <span className="sidebar__logo-text">GroupSync</span>
      </div>

      <div className="sidebar__label">Projects</div>

      {/* Group list */}
      <nav className="sidebar__nav">
        {state.groups.map((group) => (
          <button
            key={group.id}
            className={`sidebar__item ${state.activeGroupId === group.id ? 'sidebar__item--active' : ''}`}
            onClick={() => dispatch({ type: 'OPEN_PROJECT', payload: group.id })}
          >
            <FolderOpen size={16} />
            <span className="sidebar__item-name">{group.name}</span>
            <span className="sidebar__item-count">
              <Users size={12} />
              {group.members.length}
            </span>
          </button>
        ))}
      </nav>

      {/* New group button */}
      <button className="sidebar__new-btn" onClick={onNewGroup}>
        <Plus size={16} />
        New Project
      </button>

      {/* Version tag */}
      <div className="sidebar__version">V1 — Core</div>
    </aside>
  );
}
