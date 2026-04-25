/**
 * helpers.js — V4
 * 
 * V4 adds:
 *   - permissions.js logic built-in: canView, canEdit, canDelete, canComment
 *   - AUDIT_ACTIONS for audit logging
 *   - Strict task visibility rules
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

export function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const deadline = new Date(dateString); deadline.setHours(0, 0, 0, 0);
  return Math.ceil((deadline - today) / 86400000);
}


/* ═══════════════════════════════════════════════════════
   V4: PERMISSIONS ENGINE
   
   Central authorization logic. Every permission check
   goes through these functions. This is the equivalent
   of middleware in a traditional backend — enforcing
   rules at the service layer before any data mutation.
   
   RULES:
   ┌──────────────────┬─────────────┬──────────────┬──────────────┐
   │ Action           │ Owner       │ Assigned User│ Other Member │
   ├──────────────────┼─────────────┼──────────────┼──────────────┤
   │ Create Task      │ ✅          │ ❌           │ ❌           │
   │ View Task        │ ✅          │ ✅ (theirs)  │ ❌           │
   │ Update Task      │ ✅          │ ✅ (theirs)  │ ❌           │
   │ Delete Task      │ ✅          │ ❌           │ ❌           │
   │ Add Comment      │ ✅          │ ✅ (theirs)  │ ❌           │
   │ View Comments    │ ✅          │ ✅ (theirs)  │ ❌           │
   │ Add/Remove Member│ ✅          │ ❌           │ ❌           │
   │ Delete Project   │ ✅          │ ❌           │ ❌           │
   └──────────────────┴─────────────┴──────────────┴──────────────┘
   ═══════════════════════════════════════════════════════ */

/**
 * Check if a user is the project owner.
 */
export function isProjectOwner(group, userId) {
  if (!group || !userId) return false;
  return group.ownerId === userId;
}

/**
 * Get the member object for a Firebase user within a group.
 */
export function getMemberForUser(group, userId) {
  if (!group || !userId) return null;
  return group.members?.find((m) => m.userId === userId) || null;
}

/**
 * Check if a user is assigned to a specific task.
 */
export function isTaskAssignee(group, task, userId) {
  if (!group || !task || !userId) return false;
  const member = getMemberForUser(group, userId);
  return member && task.assigneeId === member.id;
}

/**
 * V4: Can this user VIEW a specific task?
 * Owner can view all. Members can only view tasks assigned to them.
 */
export function canViewTask(group, task, userId) {
  if (isProjectOwner(group, userId)) return true;
  return isTaskAssignee(group, task, userId);
}

/**
 * V4: Can this user EDIT/UPDATE a specific task?
 * Owner can edit all. Assigned user can update their own (status, progress).
 */
export function canEditTask(group, task, userId) {
  if (isProjectOwner(group, userId)) return true;
  return isTaskAssignee(group, task, userId);
}

/**
 * V4: Can this user DELETE a specific task?
 * Only the project owner can delete tasks.
 */
export function canDeleteTask(group, userId) {
  return isProjectOwner(group, userId);
}

/**
 * V4: Can this user CREATE tasks?
 * Only the project owner can create tasks.
 */
export function canCreateTask(group, userId) {
  return isProjectOwner(group, userId);
}

/**
 * V4: Can this user ADD/VIEW comments on a task?
 * Owner can comment on any task. Assigned user can comment on their task.
 */
export function canCommentOnTask(group, task, userId) {
  if (isProjectOwner(group, userId)) return true;
  return isTaskAssignee(group, task, userId);
}

/**
 * V4: Can this user manage members (add/remove)?
 * Only the project owner.
 */
export function canManageMembers(group, userId) {
  return isProjectOwner(group, userId);
}

/**
 * V4: Filter tasks to only show ones the user can see.
 * Owner sees all. Members see only their assigned tasks.
 */
export function getVisibleTasks(group, userId) {
  if (!group || !userId) return [];
  const tasks = group.tasks || [];

  if (isProjectOwner(group, userId)) {
    return tasks; // Owner sees everything
  }

  // Members only see tasks assigned to them
  const member = getMemberForUser(group, userId);
  if (!member) return [];

  return tasks.filter((task) => task.assigneeId === member.id);
}


/* ═══════════════════════════════════════════════════════
   V4: AUDIT LOG TYPES
   
   Every significant action is logged with these types.
   The audit log stores: action, userId, userName,
   targetId, details, timestamp.
   ═══════════════════════════════════════════════════════ */

export const AUDIT_ACTIONS = {
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_STATUS_CHANGED: 'task_status_changed',
  TASK_DELETED: 'task_deleted',
  COMMENT_ADDED: 'comment_added',
  COMMENT_DELETED: 'comment_deleted',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
  PROJECT_CREATED: 'project_created',
  PROJECT_DELETED: 'project_deleted',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
};
