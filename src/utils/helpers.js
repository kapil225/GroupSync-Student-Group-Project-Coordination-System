/**
 * helpers.js — V3
 * 
 * V3 adds: ROLES system, daysUntil(), deadline helpers
 */

export function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export const AVATARS = [
  '🧑‍💻', '👩‍🎓', '🧑‍🎓', '👨‍💻',
  '👩‍💻', '🧑‍🔬', '👩‍🔬', '👨‍🎓',
  '🦊', '🐱', '🐼', '🦉',
];

export const PRIORITIES = {
  low:    { label: 'Low',    color: 'var(--priority-low)' },
  medium: { label: 'Medium', color: 'var(--priority-medium)' },
  high:   { label: 'High',   color: 'var(--priority-high)' },
};

export const STATUSES = [
  { key: 'todo',        label: 'To Do',       color: '#8888aa', bg: 'rgba(136,136,170,0.08)', border: 'rgba(136,136,170,0.2)' },
  { key: 'in_progress', label: 'In Progress', color: '#4a9eff', bg: 'rgba(74,158,255,0.08)',  border: 'rgba(74,158,255,0.2)' },
  { key: 'review',      label: 'Review',      color: '#f5a623', bg: 'rgba(245,166,35,0.08)',  border: 'rgba(245,166,35,0.2)' },
  { key: 'done',        label: 'Done',        color: '#34d473', bg: 'rgba(52,212,115,0.08)',  border: 'rgba(52,212,115,0.2)' },
];

export function getStatus(key) {
  return STATUSES.find((s) => s.key === key) || STATUSES[0];
}

/**
 * V3: Role-based permissions
 * 
 * SUPER_ADMIN — can see ALL projects/users system-wide
 * OWNER       — created the project, full control
 * MEMBER      — can only update their own assigned tasks, can comment
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  MEMBER: 'member',
};

export function formatDate(isoString) {
  const sec = Math.floor((new Date() - new Date(isoString)) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * V3: Calculate days until a deadline.
 * Positive = future, 0 = today, negative = overdue
 */
export function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const deadline = new Date(dateString); deadline.setHours(0, 0, 0, 0);
  return Math.ceil((deadline - today) / 86400000);
}
