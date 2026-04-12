/**
 * TaskCard.jsx
 * 
 * Displays a single task as a card with:
 *   - A colored left border indicating priority (green/amber/red)
 *   - The task title and description (truncated to 2 lines)
 *   - The assigned member's avatar and name (or "Unassigned")
 *   - A delete button that appears on hover
 * 
 * Each card has a staggered entrance animation.
 */

import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { PRIORITIES } from '../../utils/helpers';
import { Trash2 } from 'lucide-react';
import './TaskCard.css';

export default function TaskCard({ task, index }) {
  const { dispatch } = useGroup();
  const group = useActiveGroup();

  // Look up the assigned member (might be null if unassigned)
  const assignee = group?.members.find((member) => member.id === task.assigneeId);

  // Get the priority config (label + color)
  const priority = PRIORITIES[task.priority];

  // Delete this task
  const handleDelete = () => {
    dispatch({
      type: 'DELETE_TASK',
      payload: {
        groupId: group.id,
        taskId: task.id,
      },
    });
  };

  return (
    <div
      className="task-card"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Colored left border — visual priority indicator */}
      <span
        className="task-card__priority-bar"
        style={{ background: priority.color }}
        title={`${priority.label} priority`}
      />

      {/* ── Main Content ── */}
      <div className="task-card__content">
        <h4 className="task-card__title">{task.title}</h4>

        {/* Only show description if one was provided */}
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}
      </div>

      {/* ── Footer: Assignee + Delete ── */}
      <div className="task-card__footer">
        {assignee ? (
          <span className="task-card__assignee">
            <span className="task-card__assignee-avatar">{assignee.avatar}</span>
            {assignee.name}
          </span>
        ) : (
          <span className="task-card__unassigned">Unassigned</span>
        )}

        <button
          className="task-card__delete"
          title="Delete this task"
          onClick={handleDelete}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
