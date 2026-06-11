import { useContext, useMemo } from 'react';
import type { FeatureState } from '@astrapi69/feature-strategy';
import { FeatureStrategyContext } from './feature-strategy-context';

/**
 * The evaluated state of a single feature as returned by {@link useFeature}.
 */
export interface FeatureHandle {
  /**
   * The resolved feature state.
   */
  readonly state: FeatureState;

  /**
   * True when the feature is fully usable.
   */
  readonly isActive: boolean;

  /**
   * True when the feature is visible but not interactive.
   */
  readonly isDisabled: boolean;

  /**
   * True when the feature must not be rendered.
   */
  readonly isHidden: boolean;

  /**
   * Optional human readable reason for a restrictive state.
   */
  readonly reason?: string;
}

/**
 * Evaluates the state of the feature with the given id against the
 * registry and context supplied by the nearest {@link FeatureProvider}.
 *
 * @param id - the feature identifier
 * @returns the evaluated feature handle
 * @throws Error when used outside of a FeatureProvider
 */
export function useFeature(id: string): FeatureHandle {
  const providerValue = useContext(FeatureStrategyContext);
  if (providerValue === undefined) {
    throw new Error('useFeature must be used within a FeatureProvider');
  }
  const { registry, context } = providerValue;
  return useMemo<FeatureHandle>(() => {
    const state = registry.getState(id, context);
    const reason = registry.getReason(id, context);
    return {
      state,
      isActive: state === 'active',
      isDisabled: state === 'disabled',
      isHidden: state === 'hidden',
      ...(reason !== undefined ? { reason } : {})
    };
  }, [registry, context, id]);
}
