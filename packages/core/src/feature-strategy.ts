import type { FeatureState } from './feature-state';

/**
 * A strategy that decides the state of features, optionally based on a context.
 *
 * Implementations return `undefined` from {@link FeatureStrategy.getState}
 * when they have no opinion about a feature, allowing other strategies
 * or the descriptor default to take over.
 *
 * @typeParam TContext - the shape of the evaluation context, for example
 * an object carrying the current application mode or the authenticated user
 */
export interface FeatureStrategy<TContext = unknown> {
  /**
   * Evaluates the state of the feature with the given id.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context
   * @returns the resolved state, or `undefined` when this strategy abstains
   */
  getState(id: string, context?: TContext): FeatureState | undefined;

  /**
   * Provides a human readable reason for the current verdict,
   * typically used to explain why a feature is disabled or hidden.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context
   * @returns the reason, or `undefined` when none is available
   */
  getReason?(id: string, context?: TContext): string | undefined;
}
