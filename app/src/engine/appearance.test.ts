import { describe, expect, it } from 'vitest';
import { appearanceFromMessage, appearanceFromSearch } from './appearance';

describe('appearanceFromSearch', () => {
  it('reads ?theme=light and ?theme=dark', () => {
    expect(appearanceFromSearch('?theme=light')).toBe('light');
    expect(appearanceFromSearch('?foo=1&theme=dark')).toBe('dark');
  });
  it('ignores a missing, unknown or other-themed value', () => {
    expect(appearanceFromSearch('')).toBeNull();
    expect(appearanceFromSearch('?theme=glass')).toBeNull();
    expect(appearanceFromSearch('?theme=LIGHT')).toBeNull();
  });
});

describe('appearanceFromMessage', () => {
  it('accepts only our message shape', () => {
    expect(appearanceFromMessage({ type: 'bastion:appearance', appearance: 'light' })).toBe('light');
    expect(appearanceFromMessage({ type: 'other', appearance: 'light' })).toBeNull();
    expect(appearanceFromMessage({ type: 'bastion:appearance', appearance: 'neon' })).toBeNull();
    expect(appearanceFromMessage('light')).toBeNull();
    expect(appearanceFromMessage(null)).toBeNull();
  });
});
