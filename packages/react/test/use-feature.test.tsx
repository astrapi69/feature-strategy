import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FeatureRegistry, StaticFeatureStrategy } from '@astrapi69/feature-strategy';
import { FeatureProvider, useFeature } from '../src/index';

function createRegistry(): FeatureRegistry<unknown> {
  const registry = new FeatureRegistry();
  registry.registerAll([
    { id: 'export', defaultState: 'active' },
    { id: 'git-sync', defaultState: 'active' },
    { id: 'ai-fill', defaultState: 'active' }
  ]);
  registry.setStrategy(
    new StaticFeatureStrategy(
      { 'git-sync': 'hidden', 'ai-fill': 'disabled' },
      { 'ai-fill': 'Configure an AI key' }
    )
  );
  return registry;
}

function createWrapper(registry: FeatureRegistry<unknown>) {
  return function Wrapper({ children }: { children?: ReactNode }) {
    return <FeatureProvider registry={registry}>{children}</FeatureProvider>;
  };
}

describe('useFeature', () => {
  it('throws outside of a FeatureProvider', () => {
    expect(() => renderHook(() => useFeature('export'))).toThrow(
      'useFeature must be used within a FeatureProvider'
    );
  });

  it('resolves active features', () => {
    const { result } = renderHook(() => useFeature('export'), {
      wrapper: createWrapper(createRegistry())
    });
    expect(result.current.state).toBe('active');
    expect(result.current.isActive).toBe(true);
    expect(result.current.isDisabled).toBe(false);
    expect(result.current.isHidden).toBe(false);
    expect(result.current.reason).toBeUndefined();
  });

  it('resolves disabled features with a reason', () => {
    const { result } = renderHook(() => useFeature('ai-fill'), {
      wrapper: createWrapper(createRegistry())
    });
    expect(result.current.state).toBe('disabled');
    expect(result.current.isDisabled).toBe(true);
    expect(result.current.reason).toBe('Configure an AI key');
  });

  it('resolves hidden and unknown features to hidden', () => {
    const wrapper = createWrapper(createRegistry());
    const hidden = renderHook(() => useFeature('git-sync'), { wrapper });
    expect(hidden.result.current.isHidden).toBe(true);
    const unknown = renderHook(() => useFeature('does-not-exist'), { wrapper });
    expect(unknown.result.current.isHidden).toBe(true);
  });
});
