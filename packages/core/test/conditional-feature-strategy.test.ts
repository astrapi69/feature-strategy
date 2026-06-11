import { describe, expect, it } from 'vitest';
import { ConditionalFeatureStrategy } from '../src/index';

interface AppContext {
  mode: 'api' | 'dexie';
  aiKeyConfigured: boolean;
}

const strategy = new ConditionalFeatureStrategy<AppContext>({
  'ai-fill': {
    evaluate: (context) => {
      if (context === undefined) {
        return undefined;
      }
      if (context.mode === 'api') {
        return 'active';
      }
      return context.aiKeyConfigured ? 'active' : 'disabled';
    },
    reason: (context) =>
      context?.aiKeyConfigured === false ? 'Configure an AI key to enable this feature' : undefined
  },
  'git-sync': {
    evaluate: (context) => (context?.mode === 'dexie' ? 'hidden' : 'active'),
    reason: 'Requires the git binary'
  }
});

describe('ConditionalFeatureStrategy', () => {
  it('evaluates rules against the context', () => {
    expect(strategy.getState('ai-fill', { mode: 'api', aiKeyConfigured: false })).toBe('active');
    expect(strategy.getState('ai-fill', { mode: 'dexie', aiKeyConfigured: true })).toBe('active');
    expect(strategy.getState('ai-fill', { mode: 'dexie', aiKeyConfigured: false })).toBe('disabled');
    expect(strategy.getState('git-sync', { mode: 'dexie', aiKeyConfigured: false })).toBe('hidden');
  });

  it('abstains for features without a rule', () => {
    expect(strategy.getState('export', { mode: 'dexie', aiKeyConfigured: false })).toBeUndefined();
    expect(strategy.getReason('export', { mode: 'dexie', aiKeyConfigured: false })).toBeUndefined();
  });

  it('abstains when the rule abstains', () => {
    expect(strategy.getState('ai-fill')).toBeUndefined();
  });

  it('reports reasons only for restrictive verdicts', () => {
    expect(strategy.getReason('ai-fill', { mode: 'api', aiKeyConfigured: false })).toBeUndefined();
    expect(strategy.getReason('ai-fill', { mode: 'dexie', aiKeyConfigured: false })).toBe(
      'Configure an AI key to enable this feature'
    );
    expect(strategy.getReason('git-sync', { mode: 'dexie', aiKeyConfigured: true })).toBe(
      'Requires the git binary'
    );
    expect(strategy.getReason('git-sync', { mode: 'api', aiKeyConfigured: true })).toBeUndefined();
  });
});
