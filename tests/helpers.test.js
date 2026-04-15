import { describe, it, expect } from 'vitest';
import { generateId, AVATARS, PRIORITIES, STATUSES, getStatus, formatDate, daysUntil, ROLES } from '../src/utils/helpers';

describe('generateId', () => {
  it('returns unique alphanumeric strings', () => {
    const ids = new Set([generateId(), generateId(), generateId()]);
    expect(ids.size).toBe(3);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+$/));
  });
});

describe('AVATARS', () => { it('has 12 options', () => { expect(AVATARS.length).toBe(12); }); });
describe('PRIORITIES', () => { it('has low/medium/high', () => { expect(Object.keys(PRIORITIES)).toEqual(['low', 'medium', 'high']); }); });

describe('STATUSES', () => {
  it('has 4 statuses in Kanban order', () => { expect(STATUSES.map((s) => s.key)).toEqual(['todo', 'in_progress', 'review', 'done']); });
});

describe('getStatus', () => {
  it('returns correct status', () => { expect(getStatus('done').label).toBe('Done'); });
  it('falls back to todo', () => { expect(getStatus('bad').key).toBe('todo'); });
});

describe('ROLES', () => {
  it('has super_admin, owner, member', () => {
    expect(ROLES.SUPER_ADMIN).toBe('super_admin');
    expect(ROLES.OWNER).toBe('owner');
    expect(ROLES.MEMBER).toBe('member');
  });
});

describe('formatDate', () => {
  it('returns "just now" for now', () => { expect(formatDate(new Date().toISOString())).toBe('just now'); });
  it('returns minutes ago', () => { expect(formatDate(new Date(Date.now() - 5 * 60000).toISOString())).toBe('5m ago'); });
  it('returns hours ago', () => { expect(formatDate(new Date(Date.now() - 3 * 3600000).toISOString())).toBe('3h ago'); });
  it('returns days ago', () => { expect(formatDate(new Date(Date.now() - 2 * 86400000).toISOString())).toBe('2d ago'); });
});

describe('daysUntil', () => {
  it('returns null for empty input', () => { expect(daysUntil(null)).toBeNull(); expect(daysUntil('')).toBeNull(); });
  it('returns 0 for today', () => { expect(daysUntil(new Date().toISOString().split('T')[0])).toBe(0); });
  it('returns positive for future', () => {
    const future = new Date(); future.setDate(future.getDate() + 5);
    expect(daysUntil(future.toISOString().split('T')[0])).toBe(5);
  });
  it('returns negative for past', () => {
    const past = new Date(); past.setDate(past.getDate() - 3);
    expect(daysUntil(past.toISOString().split('T')[0])).toBe(-3);
  });
});
