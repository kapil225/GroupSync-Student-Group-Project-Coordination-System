import { describe, it, expect } from 'vitest';
import {
  generateId, AVATARS, PRIORITIES, STATUSES, getStatus, formatDate,
  daysUntil, ROLES, AUDIT_ACTIONS,
  isProjectOwner, getMemberForUser, isTaskAssignee,
  canViewTask, canEditTask, canDeleteTask, canCreateTask,
  canCommentOnTask, canManageMembers, getVisibleTasks,
} from '../src/utils/helpers';

// ── Basic Utilities ──
describe('generateId', () => {
  it('returns unique alphanumeric strings', () => {
    const ids = new Set([generateId(), generateId(), generateId()]);
    expect(ids.size).toBe(3);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+$/));
  });
});

describe('AVATARS', () => { it('has 12 options', () => { expect(AVATARS.length).toBe(12); }); });
describe('PRIORITIES', () => { it('has low/medium/high', () => { expect(Object.keys(PRIORITIES)).toEqual(['low', 'medium', 'high']); }); });
describe('STATUSES', () => { it('has 4 in order', () => { expect(STATUSES.map((s) => s.key)).toEqual(['todo', 'in_progress', 'review', 'done']); }); });
describe('getStatus', () => { it('returns correct/fallback', () => { expect(getStatus('done').label).toBe('Done'); expect(getStatus('bad').key).toBe('todo'); }); });
describe('ROLES', () => { it('has 3 roles', () => { expect(Object.keys(ROLES).length).toBe(3); }); });
describe('AUDIT_ACTIONS', () => { it('has at least 10 actions', () => { expect(Object.keys(AUDIT_ACTIONS).length).toBeGreaterThanOrEqual(10); }); });

describe('formatDate', () => {
  it('returns "just now"', () => { expect(formatDate(new Date().toISOString())).toBe('just now'); });
  it('returns minutes ago', () => { expect(formatDate(new Date(Date.now() - 5 * 60000).toISOString())).toBe('5m ago'); });
});

describe('daysUntil', () => {
  it('returns null for empty', () => { expect(daysUntil(null)).toBeNull(); });
  it('returns 0 for today', () => { expect(daysUntil(new Date().toISOString().split('T')[0])).toBe(0); });
  it('returns positive for future', () => {
    const f = new Date(); f.setDate(f.getDate() + 5);
    expect(daysUntil(f.toISOString().split('T')[0])).toBe(5);
  });
  it('returns negative for past', () => {
    const p = new Date(); p.setDate(p.getDate() - 3);
    expect(daysUntil(p.toISOString().split('T')[0])).toBe(-3);
  });
});


// ═══════════════════════════════════════════
// V4: PERMISSIONS ENGINE TESTS
// ═══════════════════════════════════════════

const mockGroup = {
  id: 'group1',
  ownerId: 'owner-uid',
  memberIds: ['owner-uid', 'member-uid', 'other-uid'],
  members: [
    { id: 'mem1', name: 'Owner', avatar: '🧑‍💻', userId: 'owner-uid' },
    { id: 'mem2', name: 'Alice', avatar: '👩‍🎓', userId: 'member-uid' },
    { id: 'mem3', name: 'Bob', avatar: '🧑‍🎓', userId: 'other-uid' },
  ],
  tasks: [
    { id: 'task1', title: 'Task 1', assigneeId: 'mem2', status: 'todo', comments: [] },
    { id: 'task2', title: 'Task 2', assigneeId: 'mem3', status: 'in_progress', comments: [] },
    { id: 'task3', title: 'Task 3', assigneeId: null, status: 'todo', comments: [] },
  ],
};

describe('isProjectOwner', () => {
  it('returns true for owner', () => { expect(isProjectOwner(mockGroup, 'owner-uid')).toBe(true); });
  it('returns false for member', () => { expect(isProjectOwner(mockGroup, 'member-uid')).toBe(false); });
  it('returns false for null', () => { expect(isProjectOwner(mockGroup, null)).toBe(false); });
});

describe('getMemberForUser', () => {
  it('returns member object for valid user', () => {
    const m = getMemberForUser(mockGroup, 'member-uid');
    expect(m).not.toBeNull();
    expect(m.name).toBe('Alice');
  });
  it('returns null for unknown user', () => {
    expect(getMemberForUser(mockGroup, 'unknown-uid')).toBeNull();
  });
});

describe('isTaskAssignee', () => {
  it('returns true when user is assigned', () => {
    expect(isTaskAssignee(mockGroup, mockGroup.tasks[0], 'member-uid')).toBe(true);
  });
  it('returns false when user is NOT assigned', () => {
    expect(isTaskAssignee(mockGroup, mockGroup.tasks[1], 'member-uid')).toBe(false);
  });
});

describe('canViewTask', () => {
  it('owner can view any task', () => {
    expect(canViewTask(mockGroup, mockGroup.tasks[0], 'owner-uid')).toBe(true);
    expect(canViewTask(mockGroup, mockGroup.tasks[1], 'owner-uid')).toBe(true);
  });
  it('member can view their assigned task', () => {
    expect(canViewTask(mockGroup, mockGroup.tasks[0], 'member-uid')).toBe(true);
  });
  it('member CANNOT view other member task', () => {
    expect(canViewTask(mockGroup, mockGroup.tasks[1], 'member-uid')).toBe(false);
  });
});

describe('canEditTask', () => {
  it('owner can edit any task', () => {
    expect(canEditTask(mockGroup, mockGroup.tasks[0], 'owner-uid')).toBe(true);
  });
  it('assignee can edit their task', () => {
    expect(canEditTask(mockGroup, mockGroup.tasks[0], 'member-uid')).toBe(true);
  });
  it('non-assignee CANNOT edit', () => {
    expect(canEditTask(mockGroup, mockGroup.tasks[1], 'member-uid')).toBe(false);
  });
});

describe('canDeleteTask', () => {
  it('owner can delete', () => { expect(canDeleteTask(mockGroup, 'owner-uid')).toBe(true); });
  it('member CANNOT delete', () => { expect(canDeleteTask(mockGroup, 'member-uid')).toBe(false); });
});

describe('canCreateTask', () => {
  it('owner can create', () => { expect(canCreateTask(mockGroup, 'owner-uid')).toBe(true); });
  it('member CANNOT create', () => { expect(canCreateTask(mockGroup, 'member-uid')).toBe(false); });
});

describe('canCommentOnTask', () => {
  it('owner can comment on any task', () => {
    expect(canCommentOnTask(mockGroup, mockGroup.tasks[0], 'owner-uid')).toBe(true);
  });
  it('assignee can comment on their task', () => {
    expect(canCommentOnTask(mockGroup, mockGroup.tasks[0], 'member-uid')).toBe(true);
  });
  it('non-assignee CANNOT comment', () => {
    expect(canCommentOnTask(mockGroup, mockGroup.tasks[1], 'member-uid')).toBe(false);
  });
});

describe('canManageMembers', () => {
  it('owner can manage', () => { expect(canManageMembers(mockGroup, 'owner-uid')).toBe(true); });
  it('member CANNOT manage', () => { expect(canManageMembers(mockGroup, 'member-uid')).toBe(false); });
});

describe('getVisibleTasks', () => {
  it('owner sees ALL tasks', () => {
    const visible = getVisibleTasks(mockGroup, 'owner-uid');
    expect(visible.length).toBe(3);
  });
  it('member sees ONLY their assigned tasks', () => {
    const visible = getVisibleTasks(mockGroup, 'member-uid');
    expect(visible.length).toBe(1);
    expect(visible[0].id).toBe('task1');
  });
  it('member with no assignments sees nothing', () => {
    const groupNoAssign = { ...mockGroup, tasks: [{ id: 't1', assigneeId: 'mem1' }] };
    const visible = getVisibleTasks(groupNoAssign, 'member-uid');
    expect(visible.length).toBe(0);
  });
});
