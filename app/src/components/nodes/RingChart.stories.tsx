import type { Meta, StoryObj } from '@storybook/react-vite';
import { RingChart } from './RingChart';

const meta: Meta<typeof RingChart> = {
  title: 'Nodes/RingChart',
  component: RingChart,
};
export default meta;
type Story = StoryObj<typeof RingChart>;

// Exposure by counterparty (risk-desk-dashboard fixture data).
export const Happy: Story = {
  args: {
    title: 'Exposure by counterparty',
    labelColumn: 'counterparty',
    valueColumn: 'exposure',
    valueSuffix: 'M',
    data: {
      kind: 'table',
      columns: [
        { key: 'counterparty', label: 'Counterparty', type: 'string' },
        { key: 'exposure', label: 'Exposure', type: 'number' },
      ],
      rows: [
        { counterparty: 'Fjellbank', exposure: 9 },
        { counterparty: 'Kestrel Holdings', exposure: 6 },
        { counterparty: 'Solent Markets Prime', exposure: 6 },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    title: 'Exposure by counterparty',
    labelColumn: 'counterparty',
    valueColumn: 'exposure',
    valueSuffix: 'M',
    data: {
      kind: 'table',
      columns: [
        { key: 'counterparty', label: 'Counterparty', type: 'string' },
        { key: 'exposure', label: 'Exposure', type: 'number' },
      ],
      rows: [{ counterparty: 'Fjellbank', exposure: 9 }],
    },
  },
};

export const Empty: Story = {
  args: {
    title: 'Exposure by counterparty',
    labelColumn: 'counterparty',
    valueColumn: 'exposure',
    data: { kind: 'table', columns: [{ key: 'counterparty', label: 'Counterparty', type: 'string' }], rows: [] },
  },
};
