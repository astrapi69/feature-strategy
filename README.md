# feature-strategy

Framework-agnostic feature gating and component authorization for TypeScript,
inspired by [wicket.component.authorization.strategy](https://github.com/astrapi69/wicket.component.authorization.strategy).
Where the Wicket original answers `isRenderable` and `isEditable` separately,
this library unifies both into a single three-state model: `active`, `disabled`, `hidden`.

## Packages

| Package | Description |
|---------|-------------|
| [`@astrapi69/feature-strategy`](packages/core) | Core API: registry, strategies, zero runtime dependencies |
| [`@astrapi69/feature-strategy-react`](packages/react) | React adapter: `FeatureProvider`, `useFeature`, `<Feature>` |

## Concept

A `FeatureRegistry` holds `FeatureDescriptor` entries, each with an id and a
default state. A configurable `FeatureStrategy` evaluates the actual state per
feature, optionally based on an application context such as the current mode
or the authenticated user. Strategies can abstain by returning `undefined`,
in which case the descriptor default applies. Unknown feature ids resolve to
`hidden`, so unregistered features never leak into the UI.

Multiple strategies combine through `CompositeStrategy`, where the most
restrictive verdict wins: `hidden` beats `disabled` beats `active`.

## Quick start

```ts
import {
  FeatureRegistry,
  ConditionalFeatureStrategy
} from '@astrapi69/feature-strategy';

interface AppContext {
  mode: 'api' | 'dexie';
}

const registry = new FeatureRegistry<AppContext>();

registry.registerAll([
  { id: 'export', defaultState: 'active' },
  { id: 'git-sync', defaultState: 'active' },
  { id: 'backup-compare', defaultState: 'active' }
]);

registry.setStrategy(
  new ConditionalFeatureStrategy<AppContext>({
    'git-sync': {
      evaluate: (context) => (context?.mode === 'dexie' ? 'hidden' : 'active'),
      reason: 'Requires the git binary'
    },
    'backup-compare': {
      evaluate: (context) => (context?.mode === 'dexie' ? 'hidden' : 'active'),
      reason: 'Requires a backend'
    }
  })
);

registry.getState('git-sync', { mode: 'dexie' });
registry.getReason('git-sync', { mode: 'dexie' });
```

## Development

```bash
npm install
npm run build
npm run test
npm run typecheck
```

The core package must be built before the react package can be type checked,
because the adapter resolves the core through its published type declarations.
The root `build` script already runs the workspaces in the correct order.

## License

MIT
