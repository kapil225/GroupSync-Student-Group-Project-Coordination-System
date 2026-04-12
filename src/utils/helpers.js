/**
 * helpers.js
 * 
 * Shared utility functions and constants used across the app.
 * 
 * This file is the single source of truth for:
 *   - ID generation
 *   - Avatar options
 *   - Priority configuration
 *   - LocalStorage read/write
 */


/**
 * Generate a unique ID for groups, members, and tasks.
 * 
 * We combine a random string with a timestamp-based string
 * to minimize the chance of collisions. This isn't as robust
 * as a real UUID library, but it's more than enough for a
 * client-side app with localStorage.
 * 
 * Example output: "k3m9f2a1x7b2"
 */
export function generateId() {
  const randomPart = Math.random().toString(36).slice(2, 10);   // 8 random chars
  const timePart = Date.now().toString(36).slice(-4);            // 4 time-based chars
  return randomPart + timePart;
}


/**
 * Emoji avatars that members can choose from.
 * 
 * We picked a mix of student/developer emojis and some fun
 * animal ones because, let's be honest, everyone wants to
 * be the fox or the owl.
 */
export const AVATARS = [
  '🧑‍💻', '👩‍🎓', '🧑‍🎓', '👨‍💻',
  '👩‍💻', '🧑‍🔬', '👩‍🔬', '👨‍🎓',
  '🦊', '🐱', '🐼', '🦉',
];


/**
 * Task priority levels.
 * 
 * Each priority has a human-readable label and a CSS color
 * (referencing our design tokens from index.css).
 * 
 * We use these both in the UI for display and in forms
 * for the priority dropdown options.
 */
export const PRIORITIES = {
  low: {
    label: 'Low',
    color: 'var(--priority-low)',    // Soft green
  },
  medium: {
    label: 'Medium',
    color: 'var(--priority-medium)', // Amber
  },
  high: {
    label: 'High',
    color: 'var(--priority-high)',   // Red
  },
};


/* ─────────────────────────────────────────────
   LOCAL STORAGE
   
   We persist the entire app state to localStorage
   so that your projects, members, and tasks survive
   page refreshes. The key below is what we use to
   store and retrieve the data.
   ───────────────────────────────────────────── */

export const STORAGE_KEY = 'groupsync-v1-data';

/**
 * Try to load saved data from localStorage.
 * Returns the parsed object, or null if nothing is saved
 * (or if the saved data is corrupted/invalid JSON).
 */
export function loadFromStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);

    if (!rawData) {
      return null; // Nothing saved yet — first time user
    }

    return JSON.parse(rawData);
  } catch (error) {
    console.warn('Could not load saved data:', error);
    return null;
  }
}

/**
 * Save the current app state to localStorage.
 * We call this every time the state changes (via a useEffect).
 */
export function saveToStorage(data) {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
}
