// "Install the app" (2026-10-09): what the Settings row can offer on this
// device. Browsers disagree — Chromium hands the page a one-tap prompt, iOS
// has no install API at all (only Share → Add to Home Screen), and an
// installed app should simply say so.
export type InstallKind = 'installed' | 'prompt' | 'ios-steps' | 'browser-menu';

export interface InstallEnvironment {
  isStandalone: boolean;
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  hasPrompt: boolean;
}

// iPadOS 13+ reports itself as a Mac, so touch points tell them apart.
const isIos = ({ userAgent, platform, maxTouchPoints }: InstallEnvironment) =>
  /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);

export function installKind(env: InstallEnvironment): InstallKind {
  if (env.isStandalone) return 'installed';
  if (env.hasPrompt) return 'prompt';
  return isIos(env) ? 'ios-steps' : 'browser-menu';
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const isInstallPromptEvent = (event: Event): event is BeforeInstallPromptEvent =>
  'prompt' in event && typeof event.prompt === 'function' && 'userChoice' in event;

export const INSTALL_COPY: Record<InstallKind, { description: string; action: string | null }> = {
  installed: { description: 'Bastion is installed. You’re using the app.', action: null },
  prompt: { description: 'Add Bastion to your Home Screen to open it full screen, like an app.', action: 'Install' },
  'ios-steps': { description: 'Tap Share, then “Add to Home Screen”, to open Bastion full screen like an app.', action: null },
  'browser-menu': { description: 'Use your browser’s menu and choose “Install app” or “Add to Home Screen”.', action: null },
};
