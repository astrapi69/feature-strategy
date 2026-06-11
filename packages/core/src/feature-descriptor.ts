import type { FeatureState } from './feature-state';

/**
 * Describes a single feature that can be registered in a {@link FeatureRegistry}.
 */
export interface FeatureDescriptor {
  /**
   * Unique identifier of the feature, for example `git-sync` or `backup-compare`.
   */
  readonly id: string;

  /**
   * The state the feature falls back to when no strategy provides a verdict.
   */
  readonly defaultState: FeatureState;

  /**
   * Optional arbitrary metadata, for example a display name or a category.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}
