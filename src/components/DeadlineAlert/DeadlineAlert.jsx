/**
 * DeadlineAlert.jsx — V3 NEW
 * 
 * A thin alert bar that appears at the top of the project view
 * when there are overdue or nearly-due tasks.
 * 
 * It shows two types of alerts:
 *   🚨 Overdue   — tasks past their deadline that aren't done yet
 *   ⏰ Urgent    — tasks due within the next 2 days (including today)
 * 
 * This component reads directly from the active group's task list
 * and only renders if there are alerts to show.
 */

import { useActiveGroup } from '../../context/GroupContext';
import { daysUntil } from '../../utils/helpers';
import './DeadlineAlert.css';

export default function DeadlineAlert() {
  const group = useActiveGroup();

  if (!group) return null;

  // Filter tasks that are NOT done and HAVE a deadline
  const activeTasks = group.tasks.filter(
    (task) => task.status !== 'done' && task.deadline
  );

  // Overdue: deadline has already passed (daysUntil returns negative)
  const overdueTasks = activeTasks.filter((task) => {
    const remaining = daysUntil(task.deadline);
    return remaining !== null && remaining < 0;
  });

  // Urgent: due within the next 2 days (today, tomorrow, day after)
  const urgentTasks = activeTasks.filter((task) => {
    const remaining = daysUntil(task.deadline);
    return remaining !== null && remaining >= 0 && remaining <= 2;
  });

  // Don't render anything if there are no alerts
  const hasAlerts = overdueTasks.length > 0 || urgentTasks.length > 0;
  if (!hasAlerts) return null;

  return (
    <div className="deadline-alert">
      {overdueTasks.length > 0 && (
        <span className="deadline-alert__overdue">
          🚨 {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
        </span>
      )}

      {urgentTasks.length > 0 && (
        <span className="deadline-alert__urgent">
          ⏰ {urgentTasks.length} task{urgentTasks.length !== 1 ? 's' : ''} due within 2 days
        </span>
      )}
    </div>
  );
}
