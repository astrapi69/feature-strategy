import type { FeatureState } from './feature-state';
import type { FeatureStrategy } from './feature-strategy';

/**
 * Describes which roles are required for a feature and what happens
 * when the requirement is not met.
 */
export interface RoleRequirement {
  /**
   * The roles relevant for the feature.
   */
  readonly roles: readonly string[];

  /**
   * When true, all listed roles are required. When false or omitted,
   * any single listed role is sufficient.
   */
  readonly requireAll?: boolean;

  /**
   * The state applied when the requirement is not met.
   * Defaults to `hidden`.
   */
  readonly missingState?: Exclude<FeatureState, 'active'>;

  /**
   * Optional reason reported when the requirement is not met.
   */
  readonly reason?: string;
}

/**
 * Extracts the current roles from the evaluation context.
 *
 * @typeParam TContext - the shape of the evaluation context
 */
export type RoleExtractor<TContext = unknown> = (context?: TContext) => readonly string[];

/**
 * A strategy that resolves feature states from role requirements.
 *
 * The strategy stays agnostic of any user model: a {@link RoleExtractor}
 * supplied by the application derives the current roles from the context.
 * Features without a requirement are abstained from.
 *
 * @typeParam TContext - the shape of the evaluation context
 */
export class RoleBasedFeatureStrategy<TContext = unknown> implements FeatureStrategy<TContext> {
  private readonly requirements: Readonly<Record<string, RoleRequirement>>;

  private readonly extractRoles: RoleExtractor<TContext>;

  /**
   * Creates a role based strategy.
   *
   * @param requirements - mapping from feature id to its role requirement
   * @param extractRoles - function deriving the current roles from the context
   */
  constructor(
    requirements: Readonly<Record<string, RoleRequirement>>,
    extractRoles: RoleExtractor<TContext>
  ) {
    this.requirements = requirements;
    this.extractRoles = extractRoles;
  }

  /**
   * Resolves the feature state from the role requirement.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context
   * @returns `active` when the requirement is met, the configured missing
   * state otherwise, or `undefined` when no requirement exists
   */
  getState(id: string, context?: TContext): FeatureState | undefined {
    const requirement = this.requirements[id];
    if (requirement === undefined) {
      return undefined;
    }
    const roles = this.extractRoles(context);
    const satisfied = requirement.requireAll === true
      ? requirement.roles.every((role) => roles.includes(role))
      : requirement.roles.some((role) => roles.includes(role));
    if (satisfied) {
      return 'active';
    }
    return requirement.missingState ?? 'hidden';
  }

  /**
   * Returns the configured reason when the requirement is not met.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context
   * @returns the reason, or `undefined` when the feature is active or has no requirement
   */
  getReason(id: string, context?: TContext): string | undefined {
    const requirement = this.requirements[id];
    if (requirement === undefined) {
      return undefined;
    }
    return this.getState(id, context) === 'active' ? undefined : requirement.reason;
  }
}
