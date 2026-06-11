import { describe, expect, it } from 'vitest';
import { FeatureRegistry, StaticFeatureStrategy } from '../src/index';

describe('FeatureRegistry', () => {
  it('throws on duplicate registration', () => {
    const registry = new FeatureRegistry();
    registry.register({ id: 'export', defaultState: 'active' });
    expect(() => registry.register({ id: 'export', defaultState: 'hidden' })).toThrow(
      "Feature 'export' is already registered"
    );
  });

  it('resolves unknown features to hidden', () => {
    const registry = new FeatureRegistry();
    expect(registry.getState('unknown')).toBe('hidden');
    expect(registry.isHidden('unknown')).toBe(true);
    expect(registry.getReason('unknown')).toBeUndefined();
  });

  it('falls back to the descriptor default without a strategy', () => {
    const registry = new FeatureRegistry();
    registry.register({ id: 'tts', defaultState: 'disabled' });
    expect(registry.getState('tts')).toBe('disabled');
  });

  it('falls back to the descriptor default when the strategy abstains', () => {
    const registry = new FeatureRegistry();
    registry.register({ id: 'tts', defaultState: 'disabled' });
    registry.setStrategy(new StaticFeatureStrategy({}));
    expect(registry.getState('tts')).toBe('disabled');
  });

  it('prefers the strategy verdict over the default', () => {
    const registry = new FeatureRegistry();
    registry.registerAll([
      { id: 'git-sync', defaultState: 'active' },
      { id: 'export', defaultState: 'active' }
    ]);
    registry.setStrategy(
      new StaticFeatureStrategy({ 'git-sync': 'hidden' }, { 'git-sync': 'Requires git binary' })
    );
    expect(registry.getState('git-sync')).toBe('hidden');
    expect(registry.getReason('git-sync')).toBe('Requires git binary');
    expect(registry.getState('export')).toBe('active');
  });

  it('exposes descriptors and ids', () => {
    const registry = new FeatureRegistry();
    registry.registerAll([
      { id: 'a', defaultState: 'active' },
      { id: 'b', defaultState: 'hidden', metadata: { label: 'Beta' } }
    ]);
    expect(registry.has('a')).toBe(true);
    expect(registry.has('c')).toBe(false);
    expect(registry.getIds()).toEqual(['a', 'b']);
    expect(registry.getDescriptor('b')?.metadata).toEqual({ label: 'Beta' });
  });

  it('provides convenience state checks', () => {
    const registry = new FeatureRegistry();
    registry.registerAll([
      { id: 'a', defaultState: 'active' },
      { id: 'b', defaultState: 'disabled' },
      { id: 'c', defaultState: 'hidden' }
    ]);
    expect(registry.isActive('a')).toBe(true);
    expect(registry.isDisabled('b')).toBe(true);
    expect(registry.isHidden('c')).toBe(true);
  });
});
