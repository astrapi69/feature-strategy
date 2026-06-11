import { describe, expect, it } from 'vitest';
import { mostRestrictive } from '../src/index';

describe('mostRestrictive', () => {
  it('ranks hidden over disabled over active', () => {
    expect(mostRestrictive('active', 'disabled')).toBe('disabled');
    expect(mostRestrictive('disabled', 'hidden')).toBe('hidden');
    expect(mostRestrictive('active', 'hidden')).toBe('hidden');
    expect(mostRestrictive('hidden', 'active')).toBe('hidden');
    expect(mostRestrictive('active', 'active')).toBe('active');
  });
});
