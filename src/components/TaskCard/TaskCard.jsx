/* ═══════════════════════════════════════════
   TaskCard — Single task display
   ═══════════════════════════════════════════ */

import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { PRIORITIES } from '../../utils/helpers';
import { Trash2 } from 'lucide-react';
import './TaskCard.css';

export default function TaskCard({ task, index }) {
  const { dispatch } = useGroup();
  const group = useActiveGroup();
  const assignee = group?.members.find((m) => m.id === task.assigneeId);
  const priority = PRIORITIES[task.priority];

  return (
    <div className="task-card" style={{ animationDelay: `${index * 0.04}s` }}>
      {/* Priority indicator */}
      <span
        className="task-card__priority"
        style={{ background: priority.color }}
        title={priority.label}
      />

      {/* Content */}
      <div className="task-card__body">
        <h4 className="task-card__title">{task.title}</h4>
        {task.description && (
          <p className="task-card__desc">{task.description}</p>
        )}
      </div>

      {/* Footer */}
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
          title="Delete task"
          onClick={() =>
            dispatch({
              type: 'DELETE_TASK',
              payload: { groupId: group.id, taskId: task.id },
            })
          }
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
