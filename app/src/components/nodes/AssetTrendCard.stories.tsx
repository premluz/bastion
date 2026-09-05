import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssetTrendCard } from './AssetTrendCard';

const meta: Meta<typeof AssetTrendCard> = {
  title: 'Nodes/AssetTrendCard',
  component: AssetTrendCard,
  decorators: [(Story) => <div style={{ width: 400 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof AssetTrendCard>;

// Zenith Protocol (Phase 21 follow-up, scenes/hottest-crypto-week-refine-refine.scene.json)
// — mock-random 75-day series, up.
export const Happy: Story = {
  args: {
    id: 'zenith-protocol',
    name: 'Zenith Protocol',
    symbol: 'ZNTH',
    seed: 'zenith-protocol',
    isUp: true,
    days: 75,
  },
};

// Short window (14, the schema's own floor) — proves the card doesn't
// break at the minimum generated length.
export const Partial: Story = {
  args: {
    id: 'aurion-governance',
    name: 'Aurion Governance',
    symbol: 'AURN',
    seed: 'aurion-governance',
    isUp: false,
    days: 14,
  },
};

// No real "empty" state exists for this node — every prop is required
// (no optional series/points to omit), so a third distinct state is a
// down peer instead of Happy's up, exercising the delta-down/red path
// AssetPriceHeader and TrendChart's own directional coloring both take.
export const Down: Story = {
  args: {
    id: 'brightlane-dao',
    name: 'Brightlane DAO',
    symbol: 'BDAO',
    seed: 'brightlane-dao',
    isUp: false,
    days: 90,
  },
};
