/**
 * Sidebar.jsx — V1 with Auth
 * 
 * Navigation panel with:
 *   - User avatar + name + logout button (top)
 *   - Project list with project codes
 *   - "Join Project" button
 *   - "New Project" button
 */

import { useGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { Users, FolderOpen, Plus, UserPlus2, LogOut } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ onNewGroup, onJoinGroup }) {
  const { state, dispatch } = useGroup();
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">

      {/* ── User Info ── */}
      <div className="sidebar__user">
        <div className="sidebar__user-info">
          <span className="sidebar__user-avatar">
            {user?.photoURL
              ? <img src={user.photoURL} alt="" className="sidebar__user-photo" />
              : '👤'
            }
          </span>
          <div className="sidebar__user-details">
            <span className="sidebar__user-name">
              {user?.displayName || 'User'}
            </span>
            <span className="sidebar__user-email">
              {user?.email}
            </span>
          </div>
        </div>
        <button className="sidebar__logout" onClick={logout} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>

      {/* ── Logo ── */}
      <div className="sidebar__logo" onClick={() => dispatch({ type: 'NAVIGATE_HOME' })}>
        <span className="sidebar__logo-icon">◈</span>
        <span className="sidebar__logo-text">GroupSync</span>
      </div>

      <div className="sidebar__label">Projects</div>

      {/* ── Project List ── */}
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
              {group.members?.length || 0}
            </span>
          </button>
        ))}

        {state.groups.length === 0 && (
          <p className="sidebar__empty-hint">
            Create or join a project below!
          </p>
        )}
      </nav>

      {/* ── Action Buttons ── */}
      <button className="sidebar__join-btn" onClick={onJoinGroup}>
        <UserPlus2 size={16} />
        Join Project
      </button>

      <button className="sidebar__new-btn" onClick={onNewGroup}>
        <Plus size={16} />
        New Project
      </button>

      <div className="sidebar__version">V1 — Core</div>
    </aside>
  );
}
