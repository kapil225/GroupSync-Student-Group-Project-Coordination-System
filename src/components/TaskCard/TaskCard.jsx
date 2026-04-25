import { useActiveGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { PRIORITIES, daysUntil, canEditTask, isProjectOwner } from '../../utils/helpers';
import { MessageCircle, Lock } from 'lucide-react';
import './TaskCard.css';

export default function TaskCard({ task, index, onClick, draggable }) {
  const group = useActiveGroup();
  const { user } = useAuth();
  const assignee = group?.members?.find((m) => m.id === task.assigneeId);
  const priority = PRIORITIES[task.priority];
  const commentCount = Array.isArray(task.comments) ? task.comments.length : 0;
  const canDrag = draggable && group && user && canEditTask(group, task, user.uid);
  const isOwner = group && user && isProjectOwner(group, user.uid);
  const remaining = daysUntil(task.deadline);
  const hasDeadline = remaining !== null;
  const isOverdue = hasDeadline && remaining < 0 && task.status !== 'done';
  const isUrgent = hasDeadline && remaining >= 0 && remaining <= 2 && task.status !== 'done';

  const handleDragStart = (e) => { if (!canDrag) { e.preventDefault(); return; } e.dataTransfer.setData('text/plain', task.id); e.dataTransfer.effectAllowed = 'move'; e.currentTarget.classList.add('task-card--dragging'); };
  const handleDragEnd = (e) => e.currentTarget.classList.remove('task-card--dragging');

  return (
    <div className={`task-card ${!canDrag && draggable ? 'task-card--locked' : ''}`} style={{ animationDelay: `${index * 0.04}s` }} onClick={onClick} draggable={canDrag} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <span className="task-card__priority-bar" style={{ background: priority.color }} />
      <div className="task-card__content">
        <h4 className="task-card__title">{task.title}{!canDrag && draggable && <Lock size={11} className="task-card__lock" />}</h4>
        {task.description && <p className="task-card__description">{task.description}</p>}
        {hasDeadline && task.status !== 'done' && (
          <span className="task-card__deadline" style={{ color: isOverdue ? '#ff5555' : isUrgent ? '#f5a623' : 'var(--text-muted)' }}>
            {isOverdue ? `⚠ ${Math.abs(remaining)}d overdue` : remaining === 0 ? '⏰ Due today' : isUrgent ? `⏰ ${remaining}d left` : `📅 ${task.deadline}`}
          </span>
        )}
      </div>
      <div className="task-card__footer">
        {assignee ? <span className="task-card__assignee"><span className="task-card__assignee-avatar">{assignee.avatar}</span>{assignee.name}</span> : <span className="task-card__unassigned">Unassigned</span>}
        {commentCount > 0 && <span className="task-card__comments"><MessageCircle size={12} />{commentCount}</span>}
      </div>
    </div>
  );
}
