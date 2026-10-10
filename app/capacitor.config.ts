import type { CapacitorConfig } from '@capacitor/cli';

// iOS wrapper (2026-10-09): the same Vite build, bundled into a native shell
// for TestFlight. The bundle ID must match the App ID registered in the Apple
// developer account — change it here before the first upload, not after.
const config: CapacitorConfig = {
  appId: 'com.bastion.bastion',
  appName: 'Bastion',
  webDir: 'dist',
  ios: {
    // The page draws under the status bar and home indicator and pads itself
    // with env(safe-area-inset-*), exactly as the installed web app does.
    contentInset: 'never',
    backgroundColor: '#0B0B0A',
  },
};

export default config;
