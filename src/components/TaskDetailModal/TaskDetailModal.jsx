/**
 * TaskDetailModal.jsx
 * 
 * A slide-out panel that shows full details for a single task.
 * Opens from the right side of the screen when you click a task card.
 * 
 * It displays and allows editing of:
 *   - Task title and description (read-only display)
 *   - Status — via clickable status pills (To Do, In Progress, Review, Done)
 *   - Priority — via a dropdown
 *   - Assignee — via a dropdown
 *   - Comments — a full CommentThread component
 *   - A delete button at the bottom
 * 
 * Closes by:
 *   - Clicking the X button
 *   - Clicking the dark backdrop
 */

import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { STATUSES, PRIORITIES } from '../../utils/helpers';
import CommentThread from '../CommentThread/CommentThread';
import { X, Trash2 } from 'lucide-react';
import './TaskDetailModal.css';

export default function TaskDetailModal({ taskId, onClose }) {
  const { dispatch } = useGroup();
  const group = useActiveGroup();

  // Safety checks
  if (!group) return null;
  const task = group.tasks.find((t) => t.id === taskId);
  if (!task) return null;

  /**
   * Update one or more fields on this task.
   * 
   * Usage: updateField({ priority: 'high' })
   *        updateField({ status: 'done' })
   */
  const updateField = (updates) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        groupId: group.id,
        taskId: task.id,
        updates: updates,
      },
    });
  };

  /**
   * Delete this task and close the panel.
   */
  const handleDelete = () => {
    dispatch({
      type: 'DELETE_TASK',
      payload: {
        groupId: group.id,
        taskId: task.id,
      },
    });
    onClose();
  };

  return (
    <div className="task-detail-overlay" onClick={onClose}>
      <div className="task-detail" onClick={(event) => event.stopPropagation()}>

        {/* ── Header ── */}
        <div className="task-detail__header">
          <h2 className="task-detail__title">{task.title}</h2>
          <button className="task-detail__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ── Description (if any) ── */}
        {task.description && (
          <p className="task-detail__desc">{task.description}</p>
        )}

        {/* ── Editable Fields ── */}
        <div className="task-detail__fields">

          {/* Status — clickable pills */}
          <div className="task-detail__field">
            <label className="task-detail__label">Status</label>
            <div className="task-detail__status-pills">
              {STATUSES.map((statusOption) => {
                const isActive = task.status === statusOption.key;

                return (
                  <button
                    key={statusOption.key}
                    className={`status-pill ${isActive ? 'status-pill--active' : ''}`}
                    style={{ '--pill-color': statusOption.color }}
                    onClick={() => updateField({ status: statusOption.key })}
                  >
                    <span className="status-pill__dot" />
                    {statusOption.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority — dropdown */}
          <div className="task-detail__field">
            <label className="task-detail__label">Priority</label>
            <select
              className="task-detail__select"
              value={task.priority}
              onChange={(event) => updateField({ priority: event.target.value })}
            >
              {Object.entries(PRIORITIES).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Assignee — dropdown */}
          <div className="task-detail__field">
            <label className="task-detail__label">Assigned To</label>
            <select
              className="task-detail__select"
              value={task.assigneeId || ''}
              onChange={(event) => {
                const value = event.target.value;
                updateField({ assigneeId: value || null });
              }}
            >
              <option value="">Unassigned</option>
              {group.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.avatar} {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Comments Section ── */}
        <CommentThread task={task} />

        {/* ── Delete Button ── */}
        <button className="task-detail__delete" onClick={handleDelete}>
          <Trash2 size={14} />
          Delete Task
        </button>
      </div>
    </div>
  );
}
