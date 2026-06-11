import { describe, expect, it } from 'vitest';
import { RoleBasedFeatureStrategy } from '../src/index';

interface UserContext {
  user?: { roles: readonly string[] };
}

const strategy = new RoleBasedFeatureStrategy<UserContext>(
  {
    'admin-panel': {
      roles: ['admin'],
      reason: 'Administrators only'
    },
    'danger-zone-reset': {
      roles: ['admin', 'owner'],
      requireAll: true,
      missingState: 'disabled',
      reason: 'Requires admin and owner role'
    },
    'beta-tools': {
      roles: ['beta', 'admin']
    }
  },
  (context) => context?.user?.roles ?? []
);

describe('RoleBasedFeatureStrategy', () => {
  it('activates when any required role is present by default', () => {
    expect(strategy.getState('beta-tools', { user: { roles: ['beta'] } })).toBe('active');
    expect(strategy.getState('beta-tools', { user: { roles: ['admin'] } })).toBe('active');
  });

  it('hides by default when the requirement is not met', () => {
    expect(strategy.getState('admin-panel', { user: { roles: ['editor'] } })).toBe('hidden');
    expect(strategy.getState('admin-panel', {})).toBe('hidden');
    expect(strategy.getState('admin-panel')).toBe('hidden');
  });

  it('supports requireAll with a custom missing state', () => {
    expect(strategy.getState('danger-zone-reset', { user: { roles: ['admin'] } })).toBe('disabled');
    expect(strategy.getState('danger-zone-reset', { user: { roles: ['admin', 'owner'] } })).toBe(
      'active'
    );
  });

  it('abstains for features without a requirement', () => {
    expect(strategy.getState('export', { user: { roles: ['admin'] } })).toBeUndefined();
    expect(strategy.getReason('export')).toBeUndefined();
  });

  it('reports the reason only when the requirement is not met', () => {
    expect(strategy.getReason('admin-panel', { user: { roles: ['editor'] } })).toBe(
      'Administrators only'
    );
    expect(strategy.getReason('admin-panel', { user: { roles: ['admin'] } })).toBeUndefined();
  });
});
