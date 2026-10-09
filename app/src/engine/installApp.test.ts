import { describe, expect, it } from 'vitest';
import { installKind, isInstallPromptEvent, type InstallEnvironment } from './installApp';

const env = (patch: Partial<InstallEnvironment>): InstallEnvironment => ({
  isStandalone: false, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/130', platform: 'Linux', maxTouchPoints: 0, hasPrompt: false, ...patch,
});

describe('installKind', () => {
  it('reports an installed app before anything else', () => {
    expect(installKind(env({ isStandalone: true, hasPrompt: true }))).toBe('installed');
  });
  it('uses the browser prompt when one was captured', () => {
    expect(installKind(env({ hasPrompt: true }))).toBe('prompt');
  });
  it('gives iPhone and iPad (including iPadOS posing as a Mac) the manual steps', () => {
    expect(installKind(env({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) CriOS/130' }))).toBe('ios-steps');
    expect(installKind(env({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605', platform: 'MacIntel', maxTouchPoints: 5 }))).toBe('ios-steps');
  });
  it('points everything else at the browser menu, and a real Mac is not an iPad', () => {
    expect(installKind(env({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605', platform: 'MacIntel' }))).toBe('browser-menu');
    expect(installKind(env({}))).toBe('browser-menu');
  });
});

describe('isInstallPromptEvent', () => {
  it('accepts only events carrying prompt() and userChoice', () => {
    expect(isInstallPromptEvent(new Event('beforeinstallprompt'))).toBe(false);
    expect(isInstallPromptEvent(Object.assign(new Event('beforeinstallprompt'), { prompt: () => Promise.resolve(), userChoice: Promise.resolve({ outcome: 'accepted' }) }))).toBe(true);
  });
});
