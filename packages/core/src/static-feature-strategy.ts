import type { FeatureState } from './feature-state';
import type { FeatureStrategy } from './feature-strategy';

/**
 * A strategy backed by a fixed mapping from feature id to state,
 * with an optional mapping from feature id to reason.
 *
 * Features that are not present in the mapping are abstained from.
 *
 * @typeParam TContext - the shape of the evaluation context, unused by this strategy
 */
export class StaticFeatureStrategy<TContext = unknown> implements FeatureStrategy<TContext> {
  private readonly states: Readonly<Record<string, FeatureState>>;

  private readonly reasons: Readonly<Record<string, string>> | undefined;

  /**
   * Creates a static strategy from the given mappings.
   *
   * @param states - fixed mapping from feature id to state
   * @param reasons - optional mapping from feature id to a human readable reason
   */
  constructor(
    states: Readonly<Record<string, FeatureState>>,
    reasons?: Readonly<Record<string, string>>
  ) {
    this.states = states;
    this.reasons = reasons;
  }

  /**
   * Returns the configured state for the feature.
   *
   * @param id - the feature identifier
   * @returns the configured state, or `undefined` when the feature is not mapped
   */
  getState(id: string): FeatureState | undefined {
    return this.states[id];
  }

  /**
   * Returns the configured reason for the feature.
   *
   * @param id - the feature identifier
   * @returns the configured reason, or `undefined` when none is mapped
   */
  getReason(id: string): string | undefined {
    return this.reasons?.[id];
  }
}
