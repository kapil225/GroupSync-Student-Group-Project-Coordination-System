import { useGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/helpers';
import { Users, FolderOpen, Plus, UserPlus2, LogOut, Shield, BarChart3 } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ onNewGroup, onJoinGroup }) {
  const { state, dispatch } = useGroup();
  const { user, userRole, logout } = useAuth();

  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;
  const hasActiveProject = state.activeGroupId !== null;

  return (
    <aside className="sidebar">
      {/* User info */}
      <div className="sidebar__user">
        <div className="sidebar__user-info">
          <span className="sidebar__user-avatar">
            {user?.photoURL ? <img src={user.photoURL} alt="" className="sidebar__user-photo" /> : '👤'}
          </span>
          <div className="sidebar__user-details">
            <span className="sidebar__user-name">{user?.displayName || 'User'}</span>
            <span className="sidebar__user-email">{user?.email}</span>
            {isSuperAdmin && <span className="sidebar__role-badge"><Shield size={10} /> Admin</span>}
          </div>
        </div>
        <button className="sidebar__logout" onClick={logout} title="Sign out"><LogOut size={16} /></button>
      </div>

      <div className="sidebar__logo" onClick={() => dispatch({ type: 'NAVIGATE_HOME' })}>
        <span className="sidebar__logo-icon">◈</span>
        <span className="sidebar__logo-text">GroupSync</span>
      </div>

      {/* Super Admin link */}
      {isSuperAdmin && (
        <button className={`sidebar__admin-btn ${state.view === 'admin' ? 'sidebar__admin-btn--active' : ''}`} onClick={() => dispatch({ type: 'NAVIGATE_ADMIN' })}>
          <Shield size={16} /> System Admin
        </button>
      )}

      <div className="sidebar__label">Projects</div>

      <nav className="sidebar__nav">
        {state.groups.map((group) => (
          <button key={group.id} className={`sidebar__item ${state.activeGroupId === group.id ? 'sidebar__item--active' : ''}`} onClick={() => dispatch({ type: 'OPEN_PROJECT', payload: group.id })}>
            <FolderOpen size={16} />
            <span className="sidebar__item-name">{group.name}</span>
            <span className="sidebar__item-count"><Users size={12} />{group.members?.length || 0}</span>
          </button>
        ))}
        {state.groups.length === 0 && <p className="sidebar__empty-hint">Create or join a project!</p>}
      </nav>

      {/* Dashboard link when project is open */}
      {hasActiveProject && (
        <button className={`sidebar__dash-btn ${state.view === 'dashboard' ? 'sidebar__dash-btn--active' : ''}`} onClick={() => dispatch({ type: 'NAVIGATE_DASHBOARD' })}>
          <BarChart3 size={16} /> Dashboard
        </button>
      )}

      <button className="sidebar__join-btn" onClick={onJoinGroup}><UserPlus2 size={16} />Join Project</button>
      <button className="sidebar__new-btn" onClick={onNewGroup}><Plus size={16} />New Project</button>
      <div className="sidebar__version">V3 — Full</div>
    </aside>
  );
}
