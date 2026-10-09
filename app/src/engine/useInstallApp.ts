import { useCallback, useSyncExternalStore } from 'react';
import { installKind, isInstallPromptEvent, type BeforeInstallPromptEvent, type InstallKind } from './installApp';

// The browser fires `beforeinstallprompt` once, early — usually before the
// Settings page exists — so it is captured here, at module load, and replayed
// to whoever subscribes later.
let pending: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    if (!isInstallPromptEvent(event)) return;
    event.preventDefault();
    pending = event;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    pending = null;
    installed = true;
    notify();
  });
}

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

// navigator.standalone is Safari's own flag for a Home Screen launch.
const isStandalone = () => installed || matchMedia('(display-mode: standalone)').matches
  || ('standalone' in navigator && navigator.standalone === true);

// One string per state so useSyncExternalStore compares by value.
const snapshot = (): InstallKind => installKind({
  isStandalone: isStandalone(), userAgent: navigator.userAgent, platform: navigator.platform,
  maxTouchPoints: navigator.maxTouchPoints, hasPrompt: pending !== null,
});

export function useInstallApp() {
  const kind = useSyncExternalStore(subscribe, snapshot);
  const install = useCallback(async () => {
    const event = pending;
    if (!event) throw new Error('No install prompt is available in this browser.');
    await event.prompt();
    const { outcome } = await event.userChoice;
    // A prompt can only be shown once; either answer spends it.
    pending = null;
    if (outcome === 'accepted') installed = true;
    notify();
    return outcome;
  }, []);
  return { kind, install };
}
