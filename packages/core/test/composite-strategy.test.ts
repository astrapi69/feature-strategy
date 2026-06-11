import { describe, expect, it } from 'vitest';
import { CompositeStrategy, StaticFeatureStrategy } from '../src/index';

describe('CompositeStrategy', () => {
  it('lets the most restrictive verdict win', () => {
    const composite = new CompositeStrategy([
      new StaticFeatureStrategy({ x: 'active' }),
      new StaticFeatureStrategy({ x: 'disabled' }),
      new StaticFeatureStrategy({ x: 'active' })
    ]);
    expect(composite.getState('x')).toBe('disabled');
  });

  it('short circuits on hidden', () => {
    const composite = new CompositeStrategy([
      new StaticFeatureStrategy({ x: 'hidden' }),
      new StaticFeatureStrategy({ x: 'active' })
    ]);
    expect(composite.getState('x')).toBe('hidden');
  });

  it('ignores abstaining strategies', () => {
    const composite = new CompositeStrategy([
      new StaticFeatureStrategy({}),
      new StaticFeatureStrategy({ x: 'disabled' })
    ]);
    expect(composite.getState('x')).toBe('disabled');
  });

  it('abstains when all strategies abstain', () => {
    const composite = new CompositeStrategy([
      new StaticFeatureStrategy({}),
      new StaticFeatureStrategy({})
    ]);
    expect(composite.getState('x')).toBeUndefined();
    expect(composite.getReason('x')).toBeUndefined();
  });

  it('returns the reason of the winning strategy', () => {
    const composite = new CompositeStrategy([
      new StaticFeatureStrategy({ x: 'active' }, { x: 'should not appear' }),
      new StaticFeatureStrategy({ x: 'hidden' }, { x: 'Requires backend' })
    ]);
    expect(composite.getReason('x')).toBe('Requires backend');
  });

  it('skips winning strategies without a reason', () => {
    const composite = new CompositeStrategy([
      new StaticFeatureStrategy({ x: 'hidden' }),
      new StaticFeatureStrategy({ x: 'hidden' }, { x: 'Second opinion' })
    ]);
    expect(composite.getReason('x')).toBe('Second opinion');
  });
});
