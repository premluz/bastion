import { describe, expect, it } from 'vitest';
import { speechLanguage } from './speechLanguage';

describe('speechLanguage', () => {
  it('keeps an English locale for its accent', () => {
    expect(speechLanguage('en-GB')).toBe('en-GB');
    expect(speechLanguage('en_AU')).toBe('en-AU');
    expect(speechLanguage('en')).toBe('en');
  });
  it('uses US English for any other device language, or none', () => {
    expect(speechLanguage('pl-PL')).toBe('en-US');
    expect(speechLanguage('de')).toBe('en-US');
    expect(speechLanguage('')).toBe('en-US');
    expect(speechLanguage(undefined)).toBe('en-US');
  });
  it('does not mistake a language that merely starts with en', () => {
    expect(speechLanguage('enx-XX')).toBe('en-US');
  });
});
