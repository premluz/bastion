import type { Meta, StoryObj } from '@storybook/react-vite';
import { Comparison } from './Comparison';

const meta: Meta<typeof Comparison> = {
  title: 'Nodes/Comparison',
  component: Comparison,
  decorators: [(Story) => <div style={{ width: 560 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof Comparison>;

// Asset-discovery candidates (Aldergate/Vantara/Helios), transposed:
// dimension rows, one column per entity — differing cells (all three here)
// render emphasized, per the vocabulary's "differences carry the emphasis."
export const Happy: Story = {
  args: {
    title: 'Candidates compared',
    data: {
      kind: 'table',
      columns: [
        { key: 'dimension', label: 'Dimension', type: 'string' },
        { key: 'aldergate', label: 'Aldergate Estates', type: 'string' },
        { key: 'vantara', label: 'Vantara Metals', type: 'string' },
        { key: 'helios', label: 'Helios Yield Fund', type: 'string' },
      ],
      rows: [
        { dimension: 'Yield', aldergate: '7.2%', vantara: '6.4%', helios: '9.1%' },
        { dimension: 'RiskLens score', aldergate: '34/100', vantara: '45/100', helios: '61/100' },
        { dimension: 'Liquidity', aldergate: 'Moderate', vantara: 'Thin', helios: 'Moderate' },
        { dimension: 'Jurisdiction', aldergate: 'Germany', vantara: 'Switzerland', helios: 'Luxembourg' },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    title: 'Candidates compared',
    data: {
      kind: 'table',
      columns: [
        { key: 'dimension', label: 'Dimension', type: 'string' },
        { key: 'aldergate', label: 'Aldergate Estates', type: 'string' },
        { key: 'vantara', label: 'Vantara Metals', type: 'string' },
      ],
      rows: [{ dimension: 'Yield', aldergate: '7.2%', vantara: '6.4%' }],
    },
  },
};

export const Empty: Story = {
  args: {
    title: 'Candidates compared',
    data: {
      kind: 'table',
      columns: [
        { key: 'dimension', label: 'Dimension', type: 'string' },
        { key: 'aldergate', label: 'Aldergate Estates', type: 'string' },
        { key: 'vantara', label: 'Vantara Metals', type: 'string' },
      ],
      rows: [],
    },
  },
};
