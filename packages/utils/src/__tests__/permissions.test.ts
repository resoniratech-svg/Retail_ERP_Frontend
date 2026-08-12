import { describe, it, expect } from 'vitest';
import { hasPermission } from '../permissions';

describe('hasPermission', () => {
  it('returns true for super admin wildcard *:*', () => {
    expect(hasPermission(['*:*'], 'product:delete')).toBe(true);
  });

  it('returns true when exact permission is present', () => {
    expect(hasPermission(['product:view', 'product:create'], 'product:create')).toBe(true);
  });

  it('returns false when required permission is missing', () => {
    expect(hasPermission(['product:view'], 'product:delete')).toBe(false);
  });
});
