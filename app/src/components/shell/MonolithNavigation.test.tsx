import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MonolithNavigation } from './MonolithNavigation';

function renderNavigation(isComposerOpen: boolean) {
  return renderToStaticMarkup(<MonolithNavigation activeTab="home" walletTab="money" onNavigate={() => undefined}
    onMoney={() => undefined} onInvestments={() => undefined}
    onOpen={() => undefined} isComposerOpen={isComposerOpen} working={false} />);
}

describe('Attention Home monolith navigation', () => {
  it('orders the Agent Home controls around the cube', () => {
    const markup = renderNavigation(false);
    const left = markup.indexOf('aria-label="Open navigation"');
    const center = markup.indexOf('aria-label="Open assistant"');
    const right = markup.indexOf('aria-label="Open quick actions"');
    expect(left).toBeGreaterThanOrEqual(0);
    expect(center).toBeGreaterThan(left);
    expect(right).toBeGreaterThan(center);
    expect(markup).toContain('data-dock-cube=""');
  });

  it('keeps the cube slot mounted for the composer transition', () => {
    const markup = renderNavigation(true);
    expect(markup).toContain('data-composer-open="true"');
    expect(markup).toContain('data-dock-cube=""');
  });
});
