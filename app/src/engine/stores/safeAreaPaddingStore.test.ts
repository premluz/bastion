import { afterEach, describe, expect, it, vi } from 'vitest';
import { startSafeAreaPadding, useSafeAreaPaddingStore } from './safeAreaPaddingStore';

describe('safe-area padding preference', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('preserves safe areas by default and toggles them immediately', () => {
    const setAttribute = vi.fn();
    const removeAttribute = vi.fn();
    vi.stubGlobal('document', { documentElement: { setAttribute, removeAttribute } });
    expect(useSafeAreaPaddingStore.getState().enabled).toBe(true);

    startSafeAreaPadding();

    expect(removeAttribute).toHaveBeenCalledWith('data-safe-area-padding');
    useSafeAreaPaddingStore.getState().setEnabled(false);
    expect(setAttribute).toHaveBeenCalledWith('data-safe-area-padding', 'off');
    useSafeAreaPaddingStore.getState().setEnabled(true);
    expect(removeAttribute).toHaveBeenCalledTimes(2);
  });
});
