import { createContext } from 'react';
import type { FeatureRegistry } from '@astrapi69/feature-strategy';

/**
 * The value provided by the {@link FeatureProvider}: the registry plus
 * the evaluation context forwarded to every state evaluation.
 */
export interface FeatureProviderValue {
  /**
   * The registry holding feature descriptors and the active strategy.
   */
  readonly registry: FeatureRegistry<unknown>;

  /**
   * The evaluation context forwarded to the strategy, for example
   * the current application mode or the authenticated user.
   */
  readonly context?: unknown;
}

/**
 * Internal React context carrying the {@link FeatureProviderValue}.
 */
export const FeatureStrategyContext = createContext<FeatureProviderValue | undefined>(undefined);
