import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../app/src/**/*.mdx', '../app/src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Per-entity logo images (AssetLogo.tsx) — drop files in app/public/logos/,
  // named to match the entity id (e.g. nordbond-2029.svg).
  staticDirs: ['../app/public'],
};

export default config;
