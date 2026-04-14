import { describe, it, expect } from 'vitest';
import { generateId, AVATARS, PRIORITIES, STATUSES, getStatus, formatDate } from '../src/utils/helpers';

describe('generateId', () => {
  it('should return unique strings', () => {
    const ids = new Set([generateId(), generateId(), generateId()]);
    expect(ids.size).toBe(3);
  });
  it('should be alphanumeric', () => { expect(generateId()).toMatch(/^[a-z0-9]+$/); });
});

describe('AVATARS', () => { it('should have 12 options', () => { expect(AVATARS.length).toBe(12); }); });
describe('PRIORITIES', () => { it('should have low/medium/high', () => { expect(Object.keys(PRIORITIES)).toEqual(['low', 'medium', 'high']); }); });

describe('STATUSES', () => {
  it('should have 4 statuses in correct order', () => {
    expect(STATUSES.map((s) => s.key)).toEqual(['todo', 'in_progress', 'review', 'done']);
  });
  it('each status should have all properties', () => {
    STATUSES.forEach((s) => { expect(s).toHaveProperty('key'); expect(s).toHaveProperty('label'); expect(s).toHaveProperty('color'); expect(s).toHaveProperty('bg'); expect(s).toHaveProperty('border'); });
  });
});

describe('getStatus', () => {
  it('should return correct status', () => { expect(getStatus('done').label).toBe('Done'); });
  it('should fallback to todo for invalid key', () => { expect(getStatus('invalid').key).toBe('todo'); });
});

describe('formatDate', () => {
  it('should return "just now" for recent dates', () => { expect(formatDate(new Date().toISOString())).toBe('just now'); });
  it('should return minutes ago', () => { expect(formatDate(new Date(Date.now() - 5 * 60000).toISOString())).toBe('5m ago'); });
  it('should return hours ago', () => { expect(formatDate(new Date(Date.now() - 3 * 3600000).toISOString())).toBe('3h ago'); });
  it('should return days ago', () => { expect(formatDate(new Date(Date.now() - 2 * 86400000).toISOString())).toBe('2d ago'); });
});
