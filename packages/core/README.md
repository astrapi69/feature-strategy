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

The most restrictive verdict wins when strategies are combined:
`hidden` beats `disabled` beats `active`. Strategies abstain by returning
`undefined`, then the descriptor default applies. Unknown feature ids
resolve to `hidden`.

## Strategies

`StaticFeatureStrategy` maps feature ids to fixed states.
`ConditionalFeatureStrategy` evaluates rules against a context.
`RoleBasedFeatureStrategy` resolves states from role requirements through
an application supplied role extractor, without imposing a user model.
`CompositeStrategy` combines any of the above.

## License

MIT
