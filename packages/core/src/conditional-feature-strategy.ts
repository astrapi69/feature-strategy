import type { FeatureState } from './feature-state';
import type { FeatureStrategy } from './feature-strategy';

/**
 * A single rule for the {@link ConditionalFeatureStrategy}.
 *
 * @typeParam TContext - the shape of the evaluation context
 */
export interface FeatureCondition<TContext = unknown> {
  /**
   * Evaluates the feature state based on the given context.
   *
   * @param context - optional evaluation context
   * @returns the resolved state, or `undefined` to abstain
   */
  evaluate(context?: TContext): FeatureState | undefined;

  /**
   * Optional reason shown when the rule resolves to a restrictive state.
   * Either a fixed string or a function deriving the reason from the context.
   */
  readonly reason?: string | ((context?: TContext) => string | undefined);
}

/**
 * A rule based strategy that maps feature ids to {@link FeatureCondition}
 * entries which are evaluated against the current context.
 *
 * Features without a rule are abstained from. Reasons are only reported
 * for restrictive verdicts (`disabled` or `hidden`).
 *
 * @typeParam TContext - the shape of the evaluation context
 */
export class ConditionalFeatureStrategy<TContext = unknown> implements FeatureStrategy<TContext> {
  private readonly rules: Readonly<Record<string, FeatureCondition<TContext>>>;

  /**
   * Creates a conditional strategy from the given rules.
   *
   * @param rules - mapping from feature id to its condition
   */
  constructor(rules: Readonly<Record<string, FeatureCondition<TContext>>>) {
    this.rules = rules;
  }

  /**
   * Evaluates the rule registered for the feature.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context
   * @returns the resolved state, or `undefined` when no rule exists or the rule abstains
   */
  getState(id: string, context?: TContext): FeatureState | undefined {
    return this.rules[id]?.evaluate(context);
  }

  /**
   * Returns the reason of the rule when its verdict is restrictive.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context
   * @returns the reason, or `undefined` when none applies
   */
  getReason(id: string, context?: TContext): string | undefined {
    const rule = this.rules[id];
    if (rule === undefined) {
      return undefined;
    }
    const state = rule.evaluate(context);
    if (state !== 'disabled' && state !== 'hidden') {
      return undefined;
    }
    return typeof rule.reason === 'function' ? rule.reason(context) : rule.reason;
  }
}
