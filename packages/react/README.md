# @astrapi69/feature-strategy-react

React adapter for [`@astrapi69/feature-strategy`](https://www.npmjs.com/package/@astrapi69/feature-strategy).
Supports React 18 and 19.

## Install

```bash
npm install @astrapi69/feature-strategy @astrapi69/feature-strategy-react
```

## Usage

```tsx
import { useMemo } from 'react';
import { FeatureRegistry, ConditionalFeatureStrategy } from '@astrapi69/feature-strategy';
import { Feature, FeatureProvider, useFeature } from '@astrapi69/feature-strategy-react';

const registry = new FeatureRegistry<{ mode: string }>();
registry.registerAll([
  { id: 'export', defaultState: 'active' },
  { id: 'git-sync', defaultState: 'active' }
]);
registry.setStrategy(
  new ConditionalFeatureStrategy({
    'git-sync': {
      evaluate: (ctx) => (ctx?.mode === 'offline' ? 'hidden' : 'active'),
      reason: 'Requires the git binary'
    }
  })
);

function App({ mode }: { mode: string }) {
  const featureContext = useMemo(() => ({ mode }), [mode]);
  return (
    <FeatureProvider registry={registry} context={featureContext}>
      <Toolbar />
    </FeatureProvider>
  );
}

function Toolbar() {
  const exportFeature = useFeature('export');
  return (
    <div>
      <button disabled={!exportFeature.isActive}>Export</button>
      <Feature id="git-sync" whenDisabled={(reason) => <span>{reason}</span>}>
        <button>Sync</button>
      </Feature>
    </div>
  );
}
```

`useFeature(id)` returns `{ state, isActive, isDisabled, isHidden, reason }`.
The `<Feature>` component renders its children when active, the `whenDisabled`
and `whenHidden` fallbacks otherwise, or hands full control to a render
function child that receives the complete handle.

## Memoize the context object

The provider re-renders all consumers whenever the `context` prop changes
identity. An inline object literal creates a new identity on every parent
render and turns every `useFeature` consumer into a re-render, which makes
the app feel slow for no visible reason:

```tsx
// Wrong: new object identity on every render
<FeatureProvider registry={registry} context={{ mode, hasKey }}>

// Right: stable identity, changes only when the values change
const featureContext = useMemo(() => ({ mode, hasKey }), [mode, hasKey]);
<FeatureProvider registry={registry} context={featureContext}>
```

The same rule as for any React context value. When the context values do
change, that is exactly the mechanism that re-evaluates all features, so
values like an API key status must come from reactive state, not from a
one-time read at mount.

## Evaluation model and cost

Evaluation is lazy per consumer: `useFeature` evaluates state and reason on
render of the consuming component, memoized over registry, context, and id.
There is no eager evaluation in the provider, no subscriptions, no async
work. With static maps or cheap conditions the per-render cost is a map
lookup plus a condition check. Keep conditions synchronous and pure (see
the core package README). Bundle impact is roughly two to three kilobytes
gzipped for core and adapter combined.

The registry itself is treated as immutable configuration: calling
`setStrategy` after mount does not notify React. Drive runtime changes
through the `context` prop instead.

## License

MIT
