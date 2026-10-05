import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComposerModeOverlay } from './ComposerModeOverlay';
import { MobileFrame } from './MobileFrame';

const meta: Meta<typeof ComposerModeOverlay> = {
  title: 'Shell/ComposerModeOverlay',
  component: ComposerModeOverlay,
  parameters: { layout: 'fullscreen' },
  render: () => <MobileFrame initialMode="composer" />,
};
export default meta;
type Story = StoryObj<typeof ComposerModeOverlay>;
export const Open: Story = {};
