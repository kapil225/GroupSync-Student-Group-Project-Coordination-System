import { useGroup, useActiveGroup } from '../../context/GroupContext';
import TaskCard from '../TaskCard/TaskCard';
import './KanbanColumn.css';

export default function KanbanColumn({ status, tasks, onTaskClick }) {
  const { dispatch, canDragTask } = useGroup();
  const group = useActiveGroup();

  const handleDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('kanban-col--drag-over'); };
  const handleDragLeave = (e) => { e.currentTarget.classList.remove('kanban-col--drag-over'); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('kanban-col--drag-over');
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && group) {
      const task = group.tasks?.find((t) => t.id === taskId);
      if (task && canDragTask(group.id, task)) {
        dispatch({ type: 'UPDATE_TASK_STATUS', payload: { groupId: group.id, taskId, status: status.key } });
      }
    }
  };

  return (
    <div className="kanban-col" style={{ '--col-color': status.color, '--col-bg': status.bg, '--col-border': status.border }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <div className="kanban-col__header">
        <span className="kanban-col__dot" />
        <span className="kanban-col__title">{status.label}</span>
        <span className="kanban-col__count">{tasks.length}</span>
      </div>
      <div className="kanban-col__body">
        {tasks.map((task, i) => <TaskCard key={task.id} task={task} index={i} onClick={() => onTaskClick(task.id)} draggable={true} />)}
        {tasks.length === 0 && <div className="kanban-col__empty">Drop tasks here</div>}
      </div>
    </div>
  );
}
