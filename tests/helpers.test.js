/**
 * helpers.test.js — V1 Unit Tests
 * 
 * Tests for utility functions in helpers.js.
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import { generateId, AVATARS, PRIORITIES } from '../src/utils/helpers';

describe('generateId', () => {
  it('should return a non-empty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('should return IDs of at least 10 characters', () => {
    expect(generateId().length).toBeGreaterThanOrEqual(10);
  });

  it('should generate unique IDs on consecutive calls', () => {
    const ids = new Set([generateId(), generateId(), generateId(), generateId(), generateId()]);
    expect(ids.size).toBe(5);
  });

  it('should only contain alphanumeric characters', () => {
    expect(generateId()).toMatch(/^[a-z0-9]+$/);
  });
});

describe('AVATARS', () => {
  it('should be a non-empty array of strings', () => {
    expect(Array.isArray(AVATARS)).toBe(true);
    expect(AVATARS.length).toBeGreaterThanOrEqual(10);
    AVATARS.forEach((a) => expect(typeof a).toBe('string'));
  });
});

describe('PRIORITIES', () => {
  it('should have exactly three levels: low, medium, high', () => {
    expect(Object.keys(PRIORITIES)).toEqual(['low', 'medium', 'high']);
  });

  it('each priority should have a label and color', () => {
    Object.values(PRIORITIES).forEach((p) => {
      expect(p).toHaveProperty('label');
      expect(p).toHaveProperty('color');
    });
  });
});
