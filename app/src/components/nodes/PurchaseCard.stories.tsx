import type { Meta, StoryObj } from '@storybook/react-vite';
import { PurchaseCard } from './PurchaseCard';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import { buildQuoteScene } from '../../engine/buyEthScenes';

const meta: Meta<typeof PurchaseCard> = { title: 'Nodes/PurchaseCard', component: PurchaseCard,
  args: { title: 'Confirm swap', currency: 'USDT' },
  render: ({ currency }) => <SceneRenderer scene={buildQuoteScene(800, currency, false)} /> };
export default meta;
type Story = StoryObj<typeof PurchaseCard>;
export const USDT: Story = {};
export const USDC: Story = { args: { currency: 'USDC' } };
