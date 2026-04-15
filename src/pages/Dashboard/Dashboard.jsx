/**
 * Dashboard.jsx — V3 NEW
 * 
 * A visual analytics page for a project.
 * Accessible by clicking "📊 Dashboard" in the project toolbar.
 * 
 * Displays three main sections:
 * 
 *   1. OVERALL PROGRESS
 *      A circular SVG ring showing completion percentage.
 *      Green ring fills clockwise as tasks move to "Done".
 * 
 *   2. STATUS DISTRIBUTION
 *      A horizontal bar chart showing how many tasks are in
 *      each Kanban column (To Do, In Progress, Review, Done).
 *      Bar widths are proportional to the largest column.
 * 
 *   3. MEMBER WORKLOAD
 *      A grid of cards showing each member's avatar, name,
 *      and personal done/total count with a progress bar.
 *      Helps identify who's overloaded or has capacity.
 * 
 *   4. UPCOMING DEADLINES
 *      A list of the nearest upcoming deadlines so the team
 *      knows what's coming next.
 */

import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { STATUSES, daysUntil } from '../../utils/helpers';
import { ArrowLeft } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { dispatch } = useGroup();
  const group = useActiveGroup();

  if (!group) return null;

  // Go back to the Kanban board
  const goToBoard = () => {
    dispatch({ type: 'OPEN_PROJECT', payload: group.id });
  };


  /* ─────────────────────────────────────────────
     DATA CALCULATIONS
     ───────────────────────────────────────────── */

  const totalTasks = group.tasks.length;
  const completedTasks = group.tasks.filter((t) => t.status === 'done').length;
  const progressPercent = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Count tasks per status for the bar chart
  const statusCounts = STATUSES.map((status) => ({
    ...status,
    count: group.tasks.filter((t) => t.status === status.key).length,
  }));

  // Find the maximum count so we can scale bars proportionally
  const maxStatusCount = Math.max(...statusCounts.map((s) => s.count), 1);

  // Per-member breakdown: how many tasks each member has, how many are done
  const memberStats = group.members.map((member) => {
    const memberTasks = group.tasks.filter((t) => t.assigneeId === member.id);
    const memberDone = memberTasks.filter((t) => t.status === 'done').length;

    return {
      ...member,
      totalTasks: memberTasks.length,
      doneTasks: memberDone,
      percent: memberTasks.length > 0
        ? Math.round((memberDone / memberTasks.length) * 100)
        : 0,
    };
  });

  // Upcoming deadlines: active tasks with deadlines, sorted by nearest first
  const upcomingDeadlines = group.tasks
    .filter((t) => t.status !== 'done' && t.deadline)
    .map((t) => ({
      ...t,
      remaining: daysUntil(t.deadline),
    }))
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 6); // Show up to 6


  /* ─────────────────────────────────────────────
     SVG PROGRESS RING MATH
     
     We draw a circle with radius 52 and compute
     the stroke-dasharray so that the green arc
     fills proportionally to the progress.
     
     Circumference = 2 × π × 52 ≈ 327
     ───────────────────────────────────────────── */

  const circumference = 2 * Math.PI * 52; // ~327
  const progressArc = (progressPercent / 100) * circumference;


  /* ─────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────── */

  return (
    <div className="dashboard">

      {/* ── Header ── */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">{group.name}</h1>
          <p className="dashboard__subtitle">Project Dashboard</p>
        </div>
        <button className="dashboard__back-btn" onClick={goToBoard}>
          <ArrowLeft size={15} />
          Back to Board
        </button>
      </div>


      {/* ══════════════════════════════════════════
          SECTION 1: OVERALL PROGRESS
          ══════════════════════════════════════════ */}
      <div className="dashboard__card">
        <h3 className="dashboard__card-title">Overall Progress</h3>

        <div className="dashboard__progress-row">
          {/* SVG circular progress ring */}
          <svg
            className="progress-ring"
            viewBox="0 0 120 120"
            width="130"
            height="130"
          >
            {/* Background circle (grey track) */}
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="10"
            />

            {/* Foreground circle (green progress arc) */}
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="var(--success)"
              strokeWidth="10"
              strokeDasharray={`${progressArc} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />

            {/* Percentage text in the center */}
            <text
              x="60" y="60"
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--text-primary)"
              fontSize="24"
              fontWeight="700"
              fontFamily="var(--font-body)"
            >
              {progressPercent}%
            </text>
          </svg>

          {/* Summary text */}
          <div className="dashboard__progress-info">
            <p className="dashboard__progress-label">
              {completedTasks} of {totalTasks} task{totalTasks !== 1 ? 's' : ''} completed
            </p>
            <p className="dashboard__progress-hint">
              {totalTasks === 0
                ? 'Create some tasks to track progress!'
                : progressPercent === 100
                  ? 'All done — great work! 🎉'
                  : `${totalTasks - completedTasks} remaining`
              }
            </p>
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════
          SECTION 2: STATUS DISTRIBUTION
          ══════════════════════════════════════════ */}
      <div className="dashboard__card">
        <h3 className="dashboard__card-title">Status Distribution</h3>

        <div className="dashboard__bar-chart">
          {statusCounts.map((status) => (
            <div key={status.key} className="bar-row">
              {/* Status label on the left */}
              <span className="bar-row__label">{status.label}</span>

              {/* Bar track with fill */}
              <div className="bar-row__track">
                <div
                  className="bar-row__fill"
                  style={{
                    width: `${(status.count / maxStatusCount) * 100}%`,
                    background: status.color,
                  }}
                />
              </div>

              {/* Count on the right */}
              <span className="bar-row__value">{status.count}</span>
            </div>
          ))}
        </div>
      </div>


      {/* ══════════════════════════════════════════
          SECTION 3: MEMBER WORKLOAD
          ══════════════════════════════════════════ */}
      <div className="dashboard__card">
        <h3 className="dashboard__card-title">Member Workload</h3>

        {memberStats.length === 0 ? (
          <p className="dashboard__empty-hint">
            No members yet — add some from the board view.
          </p>
        ) : (
          <div className="dashboard__member-grid">
            {memberStats.map((member) => (
              <div key={member.id} className="member-stat-card">
                <span className="member-stat-card__avatar">{member.avatar}</span>
                <span className="member-stat-card__name">{member.name}</span>
                <span className="member-stat-card__count">
                  {member.doneTasks}/{member.totalTasks} done
                </span>

                {/* Mini progress bar */}
                <div className="member-stat-card__track">
                  <div
                    className="member-stat-card__fill"
                    style={{ width: `${member.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* ══════════════════════════════════════════
          SECTION 4: UPCOMING DEADLINES
          ══════════════════════════════════════════ */}
      {upcomingDeadlines.length > 0 && (
        <div className="dashboard__card">
          <h3 className="dashboard__card-title">Upcoming Deadlines</h3>

          <div className="dashboard__deadline-list">
            {upcomingDeadlines.map((task) => {
              const isOverdue = task.remaining < 0;
              const isUrgent = task.remaining >= 0 && task.remaining <= 2;
              const assignee = group.members.find((m) => m.id === task.assigneeId);

              return (
                <div key={task.id} className="deadline-row">
                  {/* Deadline indicator */}
                  <span
                    className="deadline-row__badge"
                    style={{
                      color: isOverdue ? '#ff5555' : isUrgent ? '#f5a623' : 'var(--text-muted)',
                    }}
                  >
                    {isOverdue
                      ? `⚠ ${Math.abs(task.remaining)}d overdue`
                      : task.remaining === 0
                        ? '⏰ Due today'
                        : `📅 ${task.remaining}d left`
                    }
                  </span>

                  {/* Task title */}
                  <span className="deadline-row__title">{task.title}</span>

                  {/* Assignee */}
                  {assignee && (
                    <span className="deadline-row__assignee">
                      {assignee.avatar} {assignee.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
