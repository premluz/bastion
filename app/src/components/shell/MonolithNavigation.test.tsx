import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MonolithNavigation } from './MonolithNavigation';
import type { DockContext } from './dockContext';

function renderNavigation(isComposerOpen: boolean, context: DockContext = { kind: 'root' }) {
  return renderToStaticMarkup(<MonolithNavigation activeTab="home" walletTab="money" onNavigate={() => undefined}
    onMoney={() => undefined} onInvestments={() => undefined}
    onOpen={() => undefined} isComposerOpen={isComposerOpen} working={false} context={context} />);
}

/** The opening tag of the element that wraps the first occurrence of `marker`. */
function wrapperOf(markup: string, marker: string, tag = 'span') {
  const at = markup.indexOf(marker);
  const open = markup.lastIndexOf(`<${tag}`, markup.lastIndexOf('<', at) - 1);
  return markup.slice(open, markup.indexOf('>', open) + 1);
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

  it('offers the navigation at the root, its way back held out of reach', () => {
    const markup = renderNavigation(false);
    expect(markup).toContain('data-dock-context="root"');
    expect(wrapperOf(markup, 'aria-label="Back"')).toContain('inert');
    expect(wrapperOf(markup, 'aria-label="Open navigation"')).not.toContain('inert');
    expect(wrapperOf(markup, 'aria-label="Open assistant"', 'div')).not.toContain('inert');
  });

  it('gives a page its way back in the menu\'s place, and takes the cube and + out of reach', () => {
    const markup = renderNavigation(false, { kind: 'back', label: 'Back to Money', onBack: () => undefined });
    expect(markup).toContain('data-dock-context="back"');
    expect(markup).toContain('aria-label="Back to Money"');
    expect(wrapperOf(markup, 'aria-label="Back to Money"')).not.toContain('inert');
    expect(wrapperOf(markup, 'aria-label="Open navigation"')).toContain('inert');
    expect(wrapperOf(markup, 'aria-label="Open assistant"', 'div')).toContain('inert');
    expect(markup).toContain('data-dock-cube=""');
  });
});
