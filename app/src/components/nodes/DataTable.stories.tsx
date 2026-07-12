import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable } from './DataTable';

const meta: Meta<typeof DataTable> = {
  title: 'Nodes/DataTable',
  component: DataTable,
};
export default meta;
type Story = StoryObj<typeof DataTable>;

const columns = [
  { key: 'asset', label: 'Asset', type: 'string' as const },
  { key: 'yield', label: 'Yield', type: 'string' as const },
  { key: 'riskScore', label: 'RiskLens score', type: 'string' as const },
  { key: 'jurisdiction', label: 'Jurisdiction', type: 'string' as const },
];

export const Happy: Story = {
  args: {
    data: {
      kind: 'table',
      columns,
      rows: [
        { asset: 'Aldergate Estates', yield: '7.2%', riskScore: '34/100', jurisdiction: 'Germany' },
        { asset: 'Vantara Metals', yield: '6.4%', riskScore: '45/100', jurisdiction: 'Switzerland' },
        { asset: 'Helios Yield Fund', yield: '9.1%', riskScore: '61/100', jurisdiction: 'Luxembourg' },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    data: {
      kind: 'table',
      columns,
      rows: [{ asset: 'Aldergate Estates', yield: '7.2%', riskScore: '34/100', jurisdiction: 'Germany' }],
    },
  },
};

export const Empty: Story = {
  args: { data: { kind: 'table', columns, rows: [] } },
};
