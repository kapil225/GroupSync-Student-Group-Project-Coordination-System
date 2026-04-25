import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { STATUSES, PRIORITIES, daysUntil, isProjectOwner, canEditTask, canDeleteTask } from '../../utils/helpers';
import CommentThread from '../CommentThread/CommentThread';
import { X, Trash2, Lock, Shield } from 'lucide-react';
import './TaskDetailModal.css';

export default function TaskDetailModal({ taskId, onClose }) {
  const { dispatch } = useGroup();
  const { user } = useAuth();
  const group = useActiveGroup();
  if (!group || !user) return null;
  const task = group.tasks?.find((t) => t.id === taskId);
  if (!task) return null;

  const ownerMode = isProjectOwner(group, user.uid);
  const canEdit = canEditTask(group, task, user.uid);
  const canDel = canDeleteTask(group, user.uid);

  const remaining = daysUntil(task.deadline);
  const isOverdue = remaining !== null && remaining < 0 && task.status !== 'done';
  const isUrgent = remaining !== null && remaining >= 0 && remaining <= 2 && task.status !== 'done';

  const updateField = (updates) => {
    dispatch({ type: 'UPDATE_TASK', payload: { groupId: group.id, taskId: task.id, updates } });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: { groupId: group.id, taskId: task.id } });
    onClose();
  };

  return (
    <div className="task-detail-overlay" onClick={onClose}>
      <div className="task-detail" onClick={(e) => e.stopPropagation()}>
        <div className="task-detail__header">
          <h2 className="task-detail__title">{task.title}</h2>
          <button className="task-detail__close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* V4: Permission notice */}
        {!ownerMode && canEdit && (
          <div className="task-detail__permission-notice" style={{ background: 'rgba(74,138,255,0.08)', borderColor: 'rgba(74,138,255,0.2)', color: 'var(--accent)' }}>
            <Shield size={13} /> You can update the status of this task. Other fields are restricted to the project owner.
          </div>
        )}
        {!canEdit && (
          <div className="task-detail__permission-notice">
            <Lock size={13} /> 403 Forbidden: You do not have permission to edit this task.
          </div>
        )}

        {task.description && <p className="task-detail__desc">{task.description}</p>}

        <div className="task-detail__fields">
          {/* Status — assignee can change this */}
          <div className="task-detail__field">
            <label className="task-detail__label">Status</label>
            <div className="task-detail__status-pills">
              {STATUSES.map((s) => (
                <button key={s.key} className={`status-pill ${task.status === s.key ? 'status-pill--active' : ''}`} style={{ '--pill-color': s.color }}
                  onClick={() => canEdit && updateField({ status: s.key })} disabled={!canEdit}>
                  <span className="status-pill__dot" />{s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority — owner only */}
          <div className="task-detail__field">
            <label className="task-detail__label">Priority {!ownerMode && <Lock size={10} style={{ verticalAlign: 'middle' }} />}</label>
            <select className="task-detail__select" value={task.priority} onChange={(e) => updateField({ priority: e.target.value })} disabled={!ownerMode}>
              {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Assignee — owner only */}
          <div className="task-detail__field">
            <label className="task-detail__label">Assigned To {!ownerMode && <Lock size={10} style={{ verticalAlign: 'middle' }} />}</label>
            <select className="task-detail__select" value={task.assigneeId || ''} onChange={(e) => updateField({ assigneeId: e.target.value || null })} disabled={!ownerMode}>
              <option value="">Unassigned</option>
              {group.members?.map((m) => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
            </select>
          </div>

          {/* Deadline — owner only */}
          <div className="task-detail__field">
            <label className="task-detail__label">Deadline {!ownerMode && <Lock size={10} style={{ verticalAlign: 'middle' }} />}</label>
            <input type="date" className="task-detail__select" value={task.deadline || ''} onChange={(e) => updateField({ deadline: e.target.value || null })} disabled={!ownerMode} />
            {task.deadline && task.status !== 'done' && (
              <span style={{ fontSize: 12, fontWeight: 500, marginTop: 2, color: isOverdue ? '#ff5555' : isUrgent ? '#f5a623' : 'var(--text-muted)' }}>
                {isOverdue ? `⚠ ${Math.abs(remaining)}d overdue` : remaining === 0 ? '⏰ Due today' : `📅 ${remaining}d remaining`}
              </span>
            )}
          </div>
        </div>

        {/* Comments — V4 FIXED */}
        <CommentThread task={task} />

        {/* Delete — owner only */}
        {canDel && (
          <button className="task-detail__delete" onClick={handleDelete}><Trash2 size={14} /> Delete Task</button>
        )}
      </div>
    </div>
  );
}
