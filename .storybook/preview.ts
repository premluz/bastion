import type { Preview } from '@storybook/react-vite';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import '@astryxdesign/theme-stone/theme.css';
import '../app/src/theme/tokens.base.css';
import '../app/src/theme/theme.default.css';
import '../app/src/theme/theme.ops-dark.css';
import '../app/src/theme/theme.glass.css';
import '../app/src/theme/theme.glass-light.css';
import '../app/src/theme/theme.safe-one.css';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
  },
  globalTypes: {
    theme: {
      description: 'Meridian semantic theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'default' },
          { value: 'ops-dark', title: 'ops-dark' },
          { value: 'glass', title: 'glass' },
          { value: 'glass-light', title: 'glass-light' },
          { value: 'safe-one', title: 'safe-one' },
        ],
        dynamicTitle: true,
      },
    },
    astryxTheme: {
      description: 'Astryx stock theme',
      toolbar: {
        title: 'Astryx theme',
        icon: 'component',
        items: [
          { value: 'neutral', title: 'neutral' },
          { value: 'stone', title: 'stone' },
        ],
        dynamicTitle: true,
      },
    },
    astryxScheme: {
      description: "Astryx's own light-dark() color-scheme (unmapped variables only — Meridian's bridge always stays dark)",
      toolbar: {
        title: 'Astryx scheme',
        icon: 'mirror',
        items: [
          { value: 'dark', title: 'dark' },
          { value: 'light', title: 'light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'default',
    astryxTheme: 'neutral',
    astryxScheme: 'dark',
  },
  decorators: [
    (Story, context) => {
      const theme = String(context.globals.theme ?? 'default');
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-astryx-theme', String(context.globals.astryxTheme ?? 'neutral'));
      // ops-dark/glass/glass-light are scheme-locked in their own CSS
      // (dark, dark, and light respectively) —
      // the astryxScheme toggle only has meaning under theme=default. Clearing
      // the inline style lets their stylesheet rule apply unimpeded; setting it
      // only for 'default' is what makes the toggle work there.
      document.documentElement.style.colorScheme = theme === 'default' ? String(context.globals.astryxScheme ?? 'dark') : '';
      return Story();
    },
  ],
};

export default preview;
