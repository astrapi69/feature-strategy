import { useMemo, type ReactNode } from 'react';
import type { FeatureRegistry } from '@astrapi69/feature-strategy';
import { FeatureStrategyContext, type FeatureProviderValue } from './feature-strategy-context';

/**
 * Props of the {@link FeatureProvider}.
 *
 * @typeParam TContext - the shape of the evaluation context
 */
export interface FeatureProviderProps<TContext = unknown> {
  /**
   * The registry holding feature descriptors and the active strategy.
   */
  readonly registry: FeatureRegistry<TContext>;

  /**
   * The evaluation context forwarded to the strategy. When this value
   * changes, all consuming components re-evaluate their feature state.
   */
  readonly context?: TContext;

  /**
   * The subtree that gains access to feature evaluation.
   */
  readonly children?: ReactNode;
}

/**
 * Provides a {@link FeatureRegistry} and an evaluation context to the
 * component subtree, enabling the `useFeature` hook and the `Feature` component.
 *
 * @param props - the provider props
 * @returns the provider element
 */
export function FeatureProvider<TContext = unknown>(
  props: FeatureProviderProps<TContext>
): ReactNode {
  const { registry, context, children } = props;
  const value = useMemo<FeatureProviderValue>(
    () => ({ registry: registry as FeatureRegistry<unknown>, context }),
    [registry, context]
  );
  return (
    <FeatureStrategyContext.Provider value={value}>{children}</FeatureStrategyContext.Provider>
  );
}
