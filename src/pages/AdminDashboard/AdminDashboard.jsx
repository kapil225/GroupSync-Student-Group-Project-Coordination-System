/**
 * AdminDashboard.jsx — V3 NEW
 * 
 * Super Admin page — sees everything across the entire system:
 *   - Total registered users with roles
 *   - All projects with owner, member count, task count
 *   - System-wide task completion stats
 *   - Per-user activity breakdown
 */

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { STATUSES, ROLES } from '../../utils/helpers';
import { ArrowLeft, Users, FolderOpen, ListTodo, Shield, Crown, User } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { dispatch } = useGroup();
  const { userRole } = useAuth();

  const [users, setUsers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch ALL users and ALL projects from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users
        const usersSnap = await getDocs(collection(db, 'users'));
        const userList = usersSnap.docs.map((d) => ({ uid: d.id, ...d.data() }));
        setUsers(userList);

        // Fetch all projects (admin sees everything)
        const projSnap = await getDocs(collection(db, 'projects'));
        const projList = projSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllProjects(projList);
      } catch (e) {
        console.error('Error fetching admin data:', e);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (userRole !== ROLES.SUPER_ADMIN) {
    return (
      <div className="admin-dash" style={{ padding: 60, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Only Super Admins can view this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="admin-dash" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading system data...</div>;
  }

  // ── System-wide calculations ──
  const totalUsers = users.length;
  const totalProjects = allProjects.length;
  const allTasks = allProjects.flatMap((p) => p.tasks || []);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Status breakdown
  const statusCounts = STATUSES.map((s) => ({
    ...s,
    count: allTasks.filter((t) => t.status === s.key).length,
  }));
  const maxCount = Math.max(...statusCounts.map((s) => s.count), 1);

  // Role icons
  const roleIcon = (role) => {
    if (role === ROLES.SUPER_ADMIN) return <Shield size={14} style={{ color: '#ff6b6b' }} />;
    return <User size={14} style={{ color: 'var(--text-muted)' }} />;
  };

  return (
    <div className="admin-dash">

      {/* Header */}
      <div className="admin-dash__header">
        <div>
          <h1 className="admin-dash__title">System Administration</h1>
          <p className="admin-dash__subtitle">Super Admin Dashboard — All Users & Projects</p>
        </div>
        <button className="admin-dash__back" onClick={() => dispatch({ type: 'NAVIGATE_HOME' })}>
          <ArrowLeft size={15} /> Back to Home
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="admin-dash__stats">
        <div className="stat-card">
          <Users size={20} className="stat-card__icon" />
          <span className="stat-card__value">{totalUsers}</span>
          <span className="stat-card__label">Total Users</span>
        </div>
        <div className="stat-card">
          <FolderOpen size={20} className="stat-card__icon" />
          <span className="stat-card__value">{totalProjects}</span>
          <span className="stat-card__label">Total Projects</span>
        </div>
        <div className="stat-card">
          <ListTodo size={20} className="stat-card__icon" />
          <span className="stat-card__value">{totalTasks}</span>
          <span className="stat-card__label">Total Tasks</span>
        </div>
        <div className="stat-card stat-card--accent">
          <span className="stat-card__value">{completionRate}%</span>
          <span className="stat-card__label">Completion Rate</span>
        </div>
      </div>

      {/* ── Status Distribution ── */}
      <div className="admin-dash__card">
        <h3 className="admin-dash__card-title">System-Wide Task Distribution</h3>
        <div className="admin-dash__bars">
          {statusCounts.map((s) => (
            <div key={s.key} className="bar-row">
              <span className="bar-row__label">{s.label}</span>
              <div className="bar-row__track">
                <div className="bar-row__fill" style={{ width: `${(s.count / maxCount) * 100}%`, background: s.color }} />
              </div>
              <span className="bar-row__value">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── All Users ── */}
      <div className="admin-dash__card">
        <h3 className="admin-dash__card-title">All Registered Users ({totalUsers})</h3>
        <div className="admin-dash__table-wrap">
          <table className="admin-dash__table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Projects</th>
                <th>Tasks Assigned</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const userProjects = allProjects.filter((p) => p.memberIds?.includes(u.uid));
                const userTasks = allTasks.filter((t) => {
                  const project = allProjects.find((p) => p.tasks?.some((pt) => pt.id === t.id));
                  if (!project) return false;
                  const member = project.members?.find((m) => m.userId === u.uid);
                  return member && t.assigneeId === member.id;
                });
                return (
                  <tr key={u.uid}>
                    <td className="admin-dash__user-cell">
                      {u.photoURL ? <img src={u.photoURL} alt="" className="admin-dash__user-photo" /> : <span className="admin-dash__user-avatar">👤</span>}
                      <span>{u.displayName || 'Unknown'}</span>
                    </td>
                    <td>{u.email}</td>
                    <td><span className="admin-dash__role-badge">{roleIcon(u.role)} {u.role}</span></td>
                    <td>{userProjects.length}</td>
                    <td>{userTasks.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── All Projects ── */}
      <div className="admin-dash__card">
        <h3 className="admin-dash__card-title">All Projects ({totalProjects})</h3>
        <div className="admin-dash__table-wrap">
          <table className="admin-dash__table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Code</th>
                <th>Owner</th>
                <th>Members</th>
                <th>Tasks</th>
                <th>Done</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {allProjects.map((p) => {
                const tasks = p.tasks || [];
                const done = tasks.filter((t) => t.status === 'done').length;
                const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
                return (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td className="admin-dash__code">{p.projectCode}</td>
                    <td>{p.ownerName || 'Unknown'}</td>
                    <td>{p.members?.length || 0}</td>
                    <td>{tasks.length}</td>
                    <td>{done}</td>
                    <td>
                      <div className="admin-dash__mini-bar">
                        <div className="admin-dash__mini-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="admin-dash__mini-pct">{pct}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
