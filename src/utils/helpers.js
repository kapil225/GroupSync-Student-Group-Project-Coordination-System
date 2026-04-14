/**
 * helpers.js — V2
 * 
 * V2 adds: STATUSES, getStatus(), formatDate()
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

/** V2: Kanban column definitions */
export const STATUSES = [
  { key: 'todo',        label: 'To Do',       color: '#8888aa', bg: 'rgba(136,136,170,0.08)', border: 'rgba(136,136,170,0.2)' },
  { key: 'in_progress', label: 'In Progress', color: '#4a9eff', bg: 'rgba(74,158,255,0.08)',  border: 'rgba(74,158,255,0.2)' },
  { key: 'review',      label: 'Review',      color: '#f5a623', bg: 'rgba(245,166,35,0.08)',  border: 'rgba(245,166,35,0.2)' },
  { key: 'done',        label: 'Done',        color: '#34d473', bg: 'rgba(52,212,115,0.08)',  border: 'rgba(52,212,115,0.2)' },
];

export function getStatus(key) {
  return STATUSES.find((s) => s.key === key) || STATUSES[0];
}

/** V2: Relative timestamp for comments */
export function formatDate(isoString) {
  const secondsAgo = Math.floor((new Date() - new Date(isoString)) / 1000);
  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export const STORAGE_KEY = 'groupsync-v2-data';
export function loadFromStorage() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
export function saveToStorage(data) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { console.error(e); } }
