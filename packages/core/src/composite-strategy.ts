import { mostRestrictive, type FeatureState } from './feature-state';
import type { FeatureStrategy } from './feature-strategy';

/**
 * Combines multiple strategies into one. The most restrictive verdict wins,
 * according to the ranking hidden > disabled > active.
 *
 * Strategies that abstain (return `undefined`) are ignored. When all
 * strategies abstain, the composite abstains as well.
 *
 * @typeParam TContext - the shape of the evaluation context
 */
export class CompositeStrategy<TContext = unknown> implements FeatureStrategy<TContext> {
  private readonly strategies: readonly FeatureStrategy<TContext>[];

  /**
   * Creates a composite over the given strategies.
   *
   * @param strategies - the strategies to combine, evaluated in order
   */
  constructor(strategies: readonly FeatureStrategy<TContext>[]) {
    this.strategies = strategies;
  }

  /**
   * Evaluates all strategies and returns the most restrictive verdict.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context
   * @returns the most restrictive state, or `undefined` when all strategies abstain
   */
  getState(id: string, context?: TContext): FeatureState | undefined {
    let result: FeatureState | undefined;
    for (const strategy of this.strategies) {
      const state = strategy.getState(id, context);
      if (state === undefined) {
        continue;
      }
      result = result === undefined ? state : mostRestrictive(result, state);
      if (result === 'hidden') {
        return result;
      }
    }
    return result;
  }

  /**
   * Returns the reason from the first strategy whose verdict equals
   * the winning composite verdict and that provides a reason.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context
   * @returns the reason, or `undefined` when none is available
   */
  getReason(id: string, context?: TContext): string | undefined {
    const winning = this.getState(id, context);
    if (winning === undefined) {
      return undefined;
    }
    for (const strategy of this.strategies) {
      if (strategy.getState(id, context) === winning) {
        const reason = strategy.getReason?.(id, context);
        if (reason !== undefined) {
          return reason;
        }
      }
    }
    return undefined;
  }
}
