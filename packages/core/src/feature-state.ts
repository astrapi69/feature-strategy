/**
 * The possible visibility and interaction states of a feature.
 *
 * - `active`: the feature is fully usable
 * - `disabled`: the feature is visible but not interactive
 * - `hidden`: the feature is not rendered at all
 */
export type FeatureState = 'active' | 'disabled' | 'hidden';

/**
 * Numeric severity ranking of feature states.
 * Higher values are more restrictive: hidden > disabled > active.
 */
export const FEATURE_STATE_SEVERITY: Readonly<Record<FeatureState, number>> = {
  active: 0,
  disabled: 1,
  hidden: 2
};

/**
 * Returns the more restrictive of two feature states
 * according to the severity ranking hidden > disabled > active.
 *
 * @param first - the first state to compare
 * @param second - the second state to compare
 * @returns the state with the higher severity
 */
export function mostRestrictive(first: FeatureState, second: FeatureState): FeatureState {
  return FEATURE_STATE_SEVERITY[first] >= FEATURE_STATE_SEVERITY[second] ? first : second;
}
