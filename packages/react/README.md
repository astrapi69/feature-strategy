# @astrapi69/feature-strategy-react

React adapter for [`@astrapi69/feature-strategy`](https://www.npmjs.com/package/@astrapi69/feature-strategy).
Supports React 18 and 19.

## Install

```bash
npm install @astrapi69/feature-strategy @astrapi69/feature-strategy-react
```

## Usage

```tsx
import { FeatureRegistry, StaticFeatureStrategy } from '@astrapi69/feature-strategy';
import { Feature, FeatureProvider, useFeature } from '@astrapi69/feature-strategy-react';

const registry = new FeatureRegistry();
registry.registerAll([
  { id: 'export', defaultState: 'active' },
  { id: 'git-sync', defaultState: 'active' }
]);
registry.setStrategy(
  new StaticFeatureStrategy({ 'git-sync': 'hidden' }, { 'git-sync': 'Requires the git binary' })
);

function App() {
  return (
    <FeatureProvider registry={registry} context={{ mode: 'dexie' }}>
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
function child that receives the complete handle. When the `context` prop of
the provider changes, all consumers re-evaluate.

## License

MIT
