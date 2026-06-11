import type { ReactNode } from 'react';
import { useFeature, type FeatureHandle } from './use-feature';

/**
 * Props of the {@link Feature} component.
 */
export interface FeatureProps {
  /**
   * The feature identifier to evaluate.
   */
  readonly id: string;

  /**
   * Content rendered when the feature is active. A render function
   * receives the full {@link FeatureHandle} and takes over rendering
   * for all states.
   */
  readonly children?: ReactNode | ((handle: FeatureHandle) => ReactNode);

  /**
   * Content rendered when the feature is disabled. A render function
   * receives the optional reason. Defaults to nothing.
   */
  readonly whenDisabled?: ReactNode | ((reason?: string) => ReactNode);

  /**
   * Content rendered when the feature is hidden. Defaults to nothing.
   */
  readonly whenHidden?: ReactNode;
}

/**
 * Declarative wrapper around {@link useFeature}: renders its children
 * when the feature is active and the configured fallbacks otherwise.
 *
 * @param props - the component props
 * @returns the rendered content for the current feature state
 */
export function Feature(props: FeatureProps): ReactNode {
  const { id, children, whenDisabled, whenHidden } = props;
  const handle = useFeature(id);
  if (typeof children === 'function') {
    return <>{children(handle)}</>;
  }
  if (handle.isHidden) {
    return <>{whenHidden ?? null}</>;
  }
  if (handle.isDisabled) {
    const fallback = typeof whenDisabled === 'function' ? whenDisabled(handle.reason) : whenDisabled;
    return <>{fallback ?? null}</>;
  }
  return <>{children}</>;
}
