# @astrapi69/feature-strategy

Framework-agnostic feature gating with three states: `active`, `disabled`, `hidden`.
Zero runtime dependencies. ESM and CJS.

## Install

```bash
npm install @astrapi69/feature-strategy
```

## Usage

```ts
import {
  FeatureRegistry,
  CompositeStrategy,
  StaticFeatureStrategy,
  RoleBasedFeatureStrategy
} from '@astrapi69/feature-strategy';

interface AppContext {
  user?: { roles: readonly string[] };
}

const registry = new FeatureRegistry<AppContext>();

registry.registerAll([
  { id: 'export', defaultState: 'active' },
  { id: 'admin-panel', defaultState: 'hidden' },
  { id: 'tts', defaultState: 'active' }
]);

registry.setStrategy(
  new CompositeStrategy<AppContext>([
    new StaticFeatureStrategy({ tts: 'hidden' }, { tts: 'Requires a TTS engine' }),
    new RoleBasedFeatureStrategy<AppContext>(
      { 'admin-panel': { roles: ['admin'], reason: 'Administrators only' } },
      (context) => context?.user?.roles ?? []
    )
  ])
);

registry.getState('admin-panel', { user: { roles: ['admin'] } });
registry.getState('tts');
registry.getReason('tts');
```

## The design principle: defaults plus deviations

This is the part worth internalizing before writing your first strategy.
Descriptors carry the normal state of a feature. Strategies contain ONLY
the deviation rules and abstain from everything else by returning
`undefined`. The registry resolves in this order:

1. the strategy verdict, when it returns one
2. the descriptor `defaultState`, when the strategy abstains
3. `hidden` for unknown feature ids (fail closed)

Do not write a strategy as a total function that returns a verdict for
every feature. If most of your features are always active, they should
appear only as descriptors with `defaultState: 'active'` and never in a
strategy. A strategy with a catch-all `return 'active'` branch duplicates
your feature list, turns the descriptor defaults into dead code, and
silently disables the fail-closed behavior for unknown ids.

When several strategies are combined through `CompositeStrategy`, the most
restrictive non-abstaining verdict wins: `hidden` beats `disabled` beats
`active`. Abstention is what makes this composition work, since each
strategy only speaks up about the features it actually governs.

## Conditions must be cheap and pure

Evaluation is lazy and happens on demand: every `getState` call evaluates
the strategy, and consumers such as the React adapter call it on render.
`CompositeStrategy.getReason` additionally re-evaluates `getState` per
inner strategy to find the winning verdict.

For static maps this is a lookup and costs nothing. For
`ConditionalFeatureStrategy`, write conditions as synchronous, pure
lookups on the context object: no async work, no DOM access, no storage
reads, no computation. Anything dynamic belongs in the context, which the
application builds once and passes in, not in the condition.

## Strategies

`StaticFeatureStrategy` maps feature ids to fixed states.
`ConditionalFeatureStrategy` evaluates rules against a context.
`RoleBasedFeatureStrategy` resolves states from role requirements through
an application supplied role extractor, without imposing a user model.
`CompositeStrategy` combines any of the above.

## License

MIT
