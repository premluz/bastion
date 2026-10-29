import { afterEach, describe, expect, it, vi } from 'vitest';
import { startTooltips, useTooltipsStore } from './tooltipsStore';

describe('tooltips preference', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('defaults off, applies the preference at startup, and updates immediately', () => {
    const setAttribute = vi.fn();
    const removeAttribute = vi.fn();
    vi.stubGlobal('document', { documentElement: { setAttribute, removeAttribute } });
    expect(useTooltipsStore.getState().enabled).toBe(false);

    startTooltips();

    expect(setAttribute).toHaveBeenCalledWith('data-tooltips-disabled', '');
    useTooltipsStore.getState().setEnabled(true);
    expect(removeAttribute).toHaveBeenCalledWith('data-tooltips-disabled');
  });
});
