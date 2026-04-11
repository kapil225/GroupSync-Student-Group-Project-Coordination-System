/* ═══════════════════════════════════════════
   Utility Helpers
   ═══════════════════════════════════════════ */

/**
 * Generate a short unique ID
 */
export function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/**
 * Available avatar emojis for members
 */
export const AVATARS = [
  '🧑‍💻', '👩‍🎓', '🧑‍🎓', '👨‍💻',
  '👩‍💻', '🧑‍🔬', '👩‍🔬', '👨‍🎓',
  '🦊', '🐱', '🐼', '🦉',
];

/**
 * Priority configuration
 */
export const PRIORITIES = {
  low:    { label: 'Low',    color: 'var(--priority-low)' },
  medium: { label: 'Medium', color: 'var(--priority-medium)' },
  high:   { label: 'High',   color: 'var(--priority-high)' },
};

/**
 * Local storage key
 */
export const STORAGE_KEY = 'groupsync-v1-data';

/**
 * Load data from localStorage
 */
export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save data to localStorage
 */
export function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}
