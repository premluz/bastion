import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssetsHomeList } from './AssetsHomeList';

// A component story, not a page story: AssetsHomeList is the reusable asset-row
// list the Home page composes. The PAGE itself has no story of its own — it is
// reached by tapping Home inside Shell/MobileFrame, matching how Merlin's pages
// are only reachable inside Shell/Frame. Theme comes from the toolbar global.
const meta: Meta<typeof AssetsHomeList> = {
  title: 'Shell/AssetsHomeList',
  component: AssetsHomeList,
};
export default meta;
type Story = StoryObj<typeof AssetsHomeList>;

// Inline rows rather than resolveAssetsHomeSummary() so the story stays
// independent of the universe seed's current contents.
export const Default: Story = {
  args: {
    rows: [
      { entityId: 'gala', name: 'Gala', symbol: 'GALA', value: 386.42, quantity: 18000, deltaPercent: 4.8 },
      { entityId: 'eth', name: 'Ethereum', symbol: 'ETH', value: 1247.8, quantity: 0.465, deltaPercent: 1.2 },
      { entityId: 'usdt', name: 'Tether', symbol: 'USDT', value: 912.76, quantity: 912.76, deltaPercent: 4.8 },
      { entityId: 'sol', name: 'Solana', symbol: 'SOL', value: 827.54, quantity: 4.75, deltaPercent: -4.3 },
    ],
  },
};

export const SingleRow: Story = {
  args: {
    rows: [{ entityId: 'eth', name: 'Ethereum', symbol: 'ETH', value: 1247.8, quantity: 0.465, deltaPercent: 1.2 }],
  },
};

// Unknown entity id falls back to CoinLogo's placeholder mark rather than
// breaking the row.
export const UnknownLogo: Story = {
  args: {
    rows: [{ entityId: 'not-a-known-ticker', name: 'Unmapped Asset', symbol: 'XYZ', value: 12.5, quantity: 3, deltaPercent: 0 }],
  },
};
