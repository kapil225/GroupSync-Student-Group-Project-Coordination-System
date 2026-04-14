/**
 * KanbanColumn.jsx
 * 
 * A single column in the Kanban board (e.g., "To Do", "In Progress").
 * 
 * Each column:
 *   - Has a colored header dot matching its status theme
 *   - Displays a count of tasks in that column
 *   - Contains a vertical stack of TaskCard components
 *   - Acts as a drop target for drag-and-drop
 *   - Shows a dashed placeholder when empty
 * 
 * DRAG & DROP:
 *   We use the native HTML5 Drag and Drop API.
 *   - Tasks set their ID in dataTransfer on dragStart (in TaskCard)
 *   - Columns listen for dragOver, dragLeave, and drop events
 *   - On drop, we read the task ID and dispatch UPDATE_TASK_STATUS
 */

import { useGroup, useActiveGroup } from '../../context/GroupContext';
import TaskCard from '../TaskCard/TaskCard';
import './KanbanColumn.css';

export default function KanbanColumn({ status, tasks, onTaskClick }) {
  const { dispatch } = useGroup();
  const group = useActiveGroup();

  /**
   * Allow dropping by preventing the default behavior.
   * Also add a visual class to highlight the column.
   */
  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('kanban-col--drag-over');
  };

  /**
   * Remove the highlight when the dragged item leaves this column.
   */
  const handleDragLeave = (event) => {
    event.currentTarget.classList.remove('kanban-col--drag-over');
  };

  /**
   * When a task is dropped on this column:
   * 1. Read the task ID from the drag data
   * 2. Dispatch an action to update its status
   * 3. Remove the visual highlight
   */
  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('kanban-col--drag-over');

    const taskId = event.dataTransfer.getData('text/plain');

    if (taskId && group) {
      dispatch({
        type: 'UPDATE_TASK_STATUS',
        payload: {
          groupId: group.id,
          taskId: taskId,
          status: status.key,
        },
      });
    }
  };

  return (
    <div
      className="kanban-col"
      style={{
        '--col-color': status.color,
        '--col-bg': status.bg,
        '--col-border': status.border,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ── Column Header ── */}
      <div className="kanban-col__header">
        <span className="kanban-col__dot" />
        <span className="kanban-col__title">{status.label}</span>
        <span className="kanban-col__count">{tasks.length}</span>
      </div>

      {/* ── Task Cards ── */}
      <div className="kanban-col__body">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onClick={() => onTaskClick(task.id)}
            draggable={true}
          />
        ))}

        {/* Empty state — shown when no tasks are in this column */}
        {tasks.length === 0 && (
          <div className="kanban-col__empty">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
