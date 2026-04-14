/**
 * TaskCard.jsx — V2
 * 
 * A single task card used inside Kanban columns.
 * 
 * WHAT'S NEW IN V2:
 *   - Cards are draggable (HTML5 Drag & Drop)
 *   - Clicking a card opens the TaskDetailModal
 *   - Shows a comment count badge (💬) when the task has comments
 *   - Visual feedback when being dragged (reduced opacity)
 * 
 * HOW DRAG WORKS:
 *   - On dragStart, we store the task ID in event.dataTransfer
 *   - The KanbanColumn component reads this ID on drop
 *   - We add/remove a CSS class for the "being dragged" visual state
 */

import { useActiveGroup } from '../../context/GroupContext';
import { PRIORITIES } from '../../utils/helpers';
import { MessageCircle } from 'lucide-react';
import './TaskCard.css';

export default function TaskCard({ task, index, onClick, draggable }) {
  const group = useActiveGroup();

  // Look up the assigned member (may be null)
  const assignee = group?.members.find((member) => member.id === task.assigneeId);

  // Get priority config for the color bar
  const priority = PRIORITIES[task.priority];

  // Count comments for the badge
  const commentCount = task.comments?.length || 0;

  /**
   * When the user starts dragging this card,
   * store the task ID so the drop target (KanbanColumn) knows which task moved.
   */
  const handleDragStart = (event) => {
    event.dataTransfer.setData('text/plain', task.id);
    event.dataTransfer.effectAllowed = 'move';

    // Add a visual class to fade out the card being dragged
    event.currentTarget.classList.add('task-card--dragging');
  };

  /**
   * Remove the dragging visual when the drag ends
   * (whether it was dropped or cancelled).
   */
  const handleDragEnd = (event) => {
    event.currentTarget.classList.remove('task-card--dragging');
  };

  return (
    <div
      className="task-card"
      style={{ animationDelay: `${index * 0.04}s` }}
      onClick={onClick}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
    >
      {/* Colored left border — shows priority at a glance */}
      <span
        className="task-card__priority-bar"
        style={{ background: priority.color }}
        title={`${priority.label} priority`}
      />

      {/* ── Main Content ── */}
      <div className="task-card__content">
        <h4 className="task-card__title">{task.title}</h4>

        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}
      </div>

      {/* ── Footer: Assignee + Comment Count ── */}
      <div className="task-card__footer">
        {assignee ? (
          <span className="task-card__assignee">
            <span className="task-card__assignee-avatar">{assignee.avatar}</span>
            {assignee.name}
          </span>
        ) : (
          <span className="task-card__unassigned">Unassigned</span>
        )}

        {/* Comment badge — only shown if there are comments */}
        {commentCount > 0 && (
          <span className="task-card__comments">
            <MessageCircle size={12} />
            {commentCount}
          </span>
        )}
      </div>
    </div>
  );
}
