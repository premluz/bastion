import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusGrid } from './StatusGrid';

const meta: Meta<typeof StatusGrid> = {
  title: 'Nodes/StatusGrid',
  component: StatusGrid,
  decorators: [(Story) => <div style={{ width: 480 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof StatusGrid>;

// Position status (risk-desk-dashboard fixture data).
export const Happy: Story = {
  args: {
    title: 'Position status',
    labelColumn: 'position',
    toneColumn: 'tone',
    data: {
      kind: 'table',
      columns: [
        { key: 'position', label: 'Position', type: 'string' },
        { key: 'tone', label: 'Tone', type: 'string' },
      ],
      rows: [
        { position: 'EUR/USD 3M Risk Reversal', tone: 'alert' },
        { position: '5Y EUR Interest Rate Swap', tone: 'ok' },
        { position: 'GBP/EUR 6M FX Forward', tone: 'ok' },
        { position: '10Y USD Interest Rate Swap', tone: 'warn' },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    title: 'Position status',
    labelColumn: 'position',
    toneColumn: 'tone',
    data: {
      kind: 'table',
      columns: [
        { key: 'position', label: 'Position', type: 'string' },
        { key: 'tone', label: 'Tone', type: 'string' },
      ],
      rows: [
        { position: 'EUR/USD 3M Risk Reversal', tone: 'alert' },
        { position: '5Y EUR Interest Rate Swap', tone: 'neutral' },
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    title: 'Position status',
    labelColumn: 'position',
    toneColumn: 'tone',
    data: { kind: 'table', columns: [{ key: 'position', label: 'Position', type: 'string' }], rows: [] },
  },
};
