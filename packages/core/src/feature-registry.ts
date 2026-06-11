import type { FeatureDescriptor } from './feature-descriptor';
import type { FeatureState } from './feature-state';
import type { FeatureStrategy } from './feature-strategy';

/**
 * Central registry that holds {@link FeatureDescriptor} entries and
 * evaluates feature states through an optional {@link FeatureStrategy}.
 *
 * Resolution order for {@link FeatureRegistry.getState}:
 * 1. the configured strategy, when it returns a verdict
 * 2. the descriptor default state
 * 3. `hidden` for unknown feature ids (fail closed)
 *
 * @typeParam TContext - the shape of the evaluation context passed to the strategy
 */
export class FeatureRegistry<TContext = unknown> {
  private readonly descriptors = new Map<string, FeatureDescriptor>();

  private strategy: FeatureStrategy<TContext> | undefined;

  /**
   * Registers a single feature descriptor.
   *
   * @param descriptor - the descriptor to register
   * @returns this registry for chaining
   * @throws Error when a descriptor with the same id is already registered
   */
  register(descriptor: FeatureDescriptor): this {
    if (this.descriptors.has(descriptor.id)) {
      throw new Error(`Feature '${descriptor.id}' is already registered`);
    }
    this.descriptors.set(descriptor.id, descriptor);
    return this;
  }

  /**
   * Registers multiple feature descriptors.
   *
   * @param descriptors - the descriptors to register
   * @returns this registry for chaining
   * @throws Error when any descriptor id is already registered
   */
  registerAll(descriptors: readonly FeatureDescriptor[]): this {
    for (const descriptor of descriptors) {
      this.register(descriptor);
    }
    return this;
  }

  /**
   * Checks whether a feature with the given id is registered.
   *
   * @param id - the feature identifier
   * @returns true when the feature is registered
   */
  has(id: string): boolean {
    return this.descriptors.has(id);
  }

  /**
   * Returns the descriptor for the given feature id.
   *
   * @param id - the feature identifier
   * @returns the descriptor, or `undefined` when not registered
   */
  getDescriptor(id: string): FeatureDescriptor | undefined {
    return this.descriptors.get(id);
  }

  /**
   * Returns the ids of all registered features.
   *
   * @returns the registered feature ids in registration order
   */
  getIds(): readonly string[] {
    return Array.from(this.descriptors.keys());
  }

  /**
   * Sets the strategy used to evaluate feature states.
   *
   * @param strategy - the strategy, or `undefined` to remove the current one
   * @returns this registry for chaining
   */
  setStrategy(strategy: FeatureStrategy<TContext> | undefined): this {
    this.strategy = strategy;
    return this;
  }

  /**
   * Evaluates the state of the feature with the given id.
   *
   * Unknown feature ids resolve to `hidden` so that unregistered
   * features never leak into the UI.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context forwarded to the strategy
   * @returns the resolved feature state
   */
  getState(id: string, context?: TContext): FeatureState {
    const descriptor = this.descriptors.get(id);
    if (descriptor === undefined) {
      return 'hidden';
    }
    return this.strategy?.getState(id, context) ?? descriptor.defaultState;
  }

  /**
   * Returns the reason for the current verdict of the feature, when available.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context forwarded to the strategy
   * @returns the reason, or `undefined` when none is available
   */
  getReason(id: string, context?: TContext): string | undefined {
    if (!this.descriptors.has(id)) {
      return undefined;
    }
    return this.strategy?.getReason?.(id, context);
  }

  /**
   * Convenience check whether the feature resolves to `active`.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context
   * @returns true when the feature is active
   */
  isActive(id: string, context?: TContext): boolean {
    return this.getState(id, context) === 'active';
  }

  /**
   * Convenience check whether the feature resolves to `disabled`.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context
   * @returns true when the feature is disabled
   */
  isDisabled(id: string, context?: TContext): boolean {
    return this.getState(id, context) === 'disabled';
  }

  /**
   * Convenience check whether the feature resolves to `hidden`.
   *
   * @param id - the feature identifier
   * @param context - optional evaluation context
   * @returns true when the feature is hidden
   */
  isHidden(id: string, context?: TContext): boolean {
    return this.getState(id, context) === 'hidden';
  }
}
