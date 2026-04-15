import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { STATUSES, PRIORITIES, daysUntil } from '../../utils/helpers';
import CommentThread from '../CommentThread/CommentThread';
import { X, Trash2, Lock } from 'lucide-react';
import './TaskDetailModal.css';

export default function TaskDetailModal({ taskId, onClose }) {
  const { dispatch, canEditTask } = useGroup();
  const group = useActiveGroup();
  if (!group) return null;
  const task = group.tasks?.find((t) => t.id === taskId);
  if (!task) return null;

  const isOwner = canEditTask(group.id, task);
  const remaining = daysUntil(task.deadline);
  const isOverdue = remaining !== null && remaining < 0 && task.status !== 'done';
  const isUrgent = remaining !== null && remaining >= 0 && remaining <= 2 && task.status !== 'done';

  const updateField = (updates) => {
    if (!isOwner) { alert('Only the project owner or task creator can edit this task.'); return; }
    dispatch({ type: 'UPDATE_TASK', payload: { groupId: group.id, taskId: task.id, updates } });
  };

  const handleDelete = () => {
    if (!isOwner) { alert('Only the project owner or task creator can delete this task.'); return; }
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

        {!isOwner && (
          <div className="task-detail__permission-notice">
            <Lock size={13} /> You can only view this task. Only the project owner or task creator can edit.
          </div>
        )}

        {task.description && <p className="task-detail__desc">{task.description}</p>}

        <div className="task-detail__fields">
          <div className="task-detail__field">
            <label className="task-detail__label">Status</label>
            <div className="task-detail__status-pills">
              {STATUSES.map((s) => (
                <button key={s.key} className={`status-pill ${task.status === s.key ? 'status-pill--active' : ''}`} style={{ '--pill-color': s.color }} onClick={() => updateField({ status: s.key })} disabled={!isOwner}>
                  <span className="status-pill__dot" />{s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="task-detail__field">
            <label className="task-detail__label">Priority</label>
            <select className="task-detail__select" value={task.priority} onChange={(e) => updateField({ priority: e.target.value })} disabled={!isOwner}>
              {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <div className="task-detail__field">
            <label className="task-detail__label">Assigned To</label>
            <select className="task-detail__select" value={task.assigneeId || ''} onChange={(e) => updateField({ assigneeId: e.target.value || null })} disabled={!isOwner}>
              <option value="">Unassigned</option>
              {group.members?.map((m) => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
            </select>
          </div>

          <div className="task-detail__field">
            <label className="task-detail__label">Deadline</label>
            <input type="date" className="task-detail__select" value={task.deadline || ''} onChange={(e) => updateField({ deadline: e.target.value || null })} disabled={!isOwner} />
            {task.deadline && task.status !== 'done' && (
              <span style={{ fontSize: 12, fontWeight: 500, marginTop: 2, color: isOverdue ? '#ff5555' : isUrgent ? '#f5a623' : 'var(--text-muted)' }}>
                {isOverdue ? `⚠ ${Math.abs(remaining)}d overdue` : remaining === 0 ? '⏰ Due today' : `📅 ${remaining}d remaining`}
              </span>
            )}
          </div>
        </div>

        <CommentThread task={task} />

        {isOwner && (
          <button className="task-detail__delete" onClick={handleDelete}><Trash2 size={14} /> Delete Task</button>
        )}
      </div>
    </div>
  );
}
