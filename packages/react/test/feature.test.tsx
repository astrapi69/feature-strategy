import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureRegistry, StaticFeatureStrategy } from '@astrapi69/feature-strategy';
import { Feature, FeatureProvider } from '../src/index';

function createRegistry(): FeatureRegistry<unknown> {
  const registry = new FeatureRegistry();
  registry.registerAll([
    { id: 'export', defaultState: 'active' },
    { id: 'git-sync', defaultState: 'active' },
    { id: 'ai-fill', defaultState: 'active' }
  ]);
  registry.setStrategy(
    new StaticFeatureStrategy(
      { 'git-sync': 'hidden', 'ai-fill': 'disabled' },
      { 'ai-fill': 'Configure an AI key' }
    )
  );
  return registry;
}

describe('Feature', () => {
  it('renders children for active features', () => {
    render(
      <FeatureProvider registry={createRegistry()}>
        <Feature id="export">
          <button data-testid="export-button">Export</button>
        </Feature>
      </FeatureProvider>
    );
    expect(screen.getByTestId('export-button')).toBeDefined();
  });

  it('renders nothing for hidden features by default', () => {
    render(
      <FeatureProvider registry={createRegistry()}>
        <Feature id="git-sync">
          <button data-testid="git-sync-button">Sync</button>
        </Feature>
      </FeatureProvider>
    );
    expect(screen.queryByTestId('git-sync-button')).toBeNull();
  });

  it('renders the whenHidden fallback', () => {
    render(
      <FeatureProvider registry={createRegistry()}>
        <Feature id="git-sync" whenHidden={<span data-testid="hidden-note">unavailable</span>}>
          <button>Sync</button>
        </Feature>
      </FeatureProvider>
    );
    expect(screen.getByTestId('hidden-note')).toBeDefined();
  });

  it('renders the whenDisabled fallback with the reason', () => {
    render(
      <FeatureProvider registry={createRegistry()}>
        <Feature
          id="ai-fill"
          whenDisabled={(reason) => <span data-testid="disabled-note">{reason}</span>}
        >
          <button>AI Fill</button>
        </Feature>
      </FeatureProvider>
    );
    expect(screen.getByTestId('disabled-note').textContent).toBe('Configure an AI key');
  });

  it('supports a render function receiving the full handle', () => {
    render(
      <FeatureProvider registry={createRegistry()}>
        <Feature id="ai-fill">
          {(handle) => (
            <button data-testid="ai-button" disabled={handle.isDisabled}>
              AI Fill
            </button>
          )}
        </Feature>
      </FeatureProvider>
    );
    const button = screen.getByTestId('ai-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
