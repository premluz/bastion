import type { Meta, StoryObj } from '@storybook/react-vite';
import { SignalFeed } from './SignalFeed';

const meta: Meta<typeof SignalFeed> = {
  title: 'Nodes/SignalFeed',
  component: SignalFeed,
  decorators: [(Story) => <div style={{ width: 480 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof SignalFeed>;

// Failed-delivery log (settlement-anomaly fixture data).
export const Happy: Story = {
  args: {
    title: 'Failed deliveries this month',
    data: {
      kind: 'table',
      columns: [
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'asset', label: 'Asset', type: 'string' },
        { key: 'wallet', label: 'Wallet', type: 'string' },
        { key: 'cause', label: 'Cause', type: 'string' },
      ],
      rows: [
        {
          date: '2026-07-06',
          asset: 'NordBond 2029',
          wallet: 'Wallet 03 (Kestrel-linked)',
          cause: 'Settlement outpaced custody confirmation cycle',
        },
        {
          date: '2026-07-08',
          asset: 'NordBond 2029',
          wallet: 'Wallet 09 (Kestrel-linked)',
          cause: 'Settlement outpaced custody confirmation cycle',
        },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    title: 'Failed deliveries this month',
    data: {
      kind: 'table',
      columns: [
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'asset', label: 'Asset', type: 'string' },
        { key: 'wallet', label: 'Wallet', type: 'string' },
        { key: 'cause', label: 'Cause', type: 'string' },
      ],
      rows: [
        {
          date: '2026-07-08',
          asset: 'NordBond 2029',
          wallet: 'Wallet 09 (Kestrel-linked)',
          cause: 'Settlement outpaced custody confirmation cycle',
        },
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    title: 'Failed deliveries this month',
    data: {
      kind: 'table',
      columns: [
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'asset', label: 'Asset', type: 'string' },
        { key: 'wallet', label: 'Wallet', type: 'string' },
        { key: 'cause', label: 'Cause', type: 'string' },
      ],
      rows: [],
    },
  },
};
