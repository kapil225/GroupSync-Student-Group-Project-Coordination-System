/**
 * AuditLog.jsx — V4 NEW
 * 
 * Shows a chronological log of all actions taken on a project.
 * Only accessible by Super Admin / project owner.
 * Reads from: projects/{projectId}/auditLog subcollection
 */

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, AUDIT_ACTIONS, isProjectOwner } from '../../utils/helpers';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import './AuditLog.css';

const ACTION_LABELS = {
  [AUDIT_ACTIONS.TASK_CREATED]: { label: 'Created task', icon: '📝', color: '#4a9eff' },
  [AUDIT_ACTIONS.TASK_UPDATED]: { label: 'Updated task', icon: '✏️', color: '#f5a623' },
  [AUDIT_ACTIONS.TASK_STATUS_CHANGED]: { label: 'Changed status', icon: '🔄', color: '#34d473' },
  [AUDIT_ACTIONS.TASK_DELETED]: { label: 'Deleted task', icon: '🗑️', color: '#e04848' },
  [AUDIT_ACTIONS.COMMENT_ADDED]: { label: 'Added comment', icon: '💬', color: '#8888aa' },
  [AUDIT_ACTIONS.COMMENT_DELETED]: { label: 'Deleted comment', icon: '💬', color: '#e04848' },
  [AUDIT_ACTIONS.MEMBER_ADDED]: { label: 'Added member', icon: '👤', color: '#34d473' },
  [AUDIT_ACTIONS.MEMBER_REMOVED]: { label: 'Removed member', icon: '👤', color: '#e04848' },
  [AUDIT_ACTIONS.PROJECT_CREATED]: { label: 'Created project', icon: '📁', color: '#4a9eff' },
  [AUDIT_ACTIONS.PROJECT_DELETED]: { label: 'Deleted project', icon: '📁', color: '#e04848' },
  [AUDIT_ACTIONS.UNAUTHORIZED_ACCESS]: { label: 'UNAUTHORIZED', icon: '🚫', color: '#ff3333' },
};

export default function AuditLog() {
  const { dispatch } = useGroup();
  const { user } = useAuth();
  const group = useActiveGroup();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!group) return;
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, 'projects', group.id, 'auditLog'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error('Error fetching audit log:', e); }
      setLoading(false);
    };
    fetchLogs();
  }, [group]);

  if (!group || !user) return null;

  return (
    <div className="audit-log">
      <div className="audit-log__header">
        <div>
          <h1 className="audit-log__title">Audit Log</h1>
          <p className="audit-log__subtitle">{group.name} — Last 100 actions</p>
        </div>
        <button className="audit-log__back" onClick={() => dispatch({ type: 'OPEN_PROJECT', payload: group.id })}>
          <ArrowLeft size={15} /> Back to Board
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>Loading audit log...</p>
      ) : logs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>No actions recorded yet.</p>
      ) : (
        <div className="audit-log__list">
          {logs.map((log) => {
            const config = ACTION_LABELS[log.action] || { label: log.action, icon: '📋', color: '#888' };
            const isUnauth = log.action === AUDIT_ACTIONS.UNAUTHORIZED_ACCESS;

            return (
              <div key={log.id} className={`audit-entry ${isUnauth ? 'audit-entry--danger' : ''}`}>
                <span className="audit-entry__icon">{config.icon}</span>
                <div className="audit-entry__body">
                  <div className="audit-entry__main">
                    <span className="audit-entry__action" style={{ color: config.color }}>{config.label}</span>
                    <span className="audit-entry__user">by {log.userName || 'Unknown'}</span>
                  </div>
                  {log.details && (
                    <div className="audit-entry__details">
                      {log.details.taskTitle && <span>Task: {log.details.taskTitle}</span>}
                      {log.details.from && log.details.to && <span>{log.details.from} → {log.details.to}</span>}
                      {log.details.memberName && <span>Member: {log.details.memberName}</span>}
                      {log.details.attempted && <span className="audit-entry__attempted"><AlertTriangle size={11} /> Attempted: {log.details.attempted}</span>}
                    </div>
                  )}
                </div>
                <span className="audit-entry__time">{log.createdAt ? formatDate(log.createdAt) : ''}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
