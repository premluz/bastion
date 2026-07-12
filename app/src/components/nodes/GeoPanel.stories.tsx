import type { Meta, StoryObj } from '@storybook/react-vite';
import { GeoPanel } from './GeoPanel';

const meta: Meta<typeof GeoPanel> = {
  title: 'Nodes/GeoPanel',
  component: GeoPanel,
  decorators: [(Story) => <div style={{ width: 360 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof GeoPanel>;

// EU-jurisdiction map (asset-discovery-refine fixture data).
export const Happy: Story = {
  args: {
    title: 'Candidates by jurisdiction',
    data: {
      kind: 'geo',
      points: [
        { id: 'aldergate-estates', label: 'Aldergate Estates — Germany', x: 0.58, y: 0.42, kind: 'eu' },
        { id: 'helios-yield-fund', label: 'Helios Yield Fund — Luxembourg', x: 0.5, y: 0.46, kind: 'eu' },
        { id: 'vantara-metals', label: 'Vantara Metals — Switzerland', x: 0.54, y: 0.56, kind: 'excluded' },
      ],
      regions: [
        {
          id: 'eu-region',
          label: 'EU-regulated jurisdictions',
          path: 'M 0.35 0.30 Q 0.55 0.20 0.70 0.35 Q 0.75 0.55 0.60 0.65 Q 0.40 0.70 0.30 0.50 Q 0.28 0.35 0.35 0.30 Z',
        },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    title: 'Candidates by jurisdiction',
    data: {
      kind: 'geo',
      points: [{ id: 'aldergate-estates', label: 'Aldergate Estates — Germany', x: 0.58, y: 0.42, kind: 'eu' }],
    },
  },
};

export const Empty: Story = {
  args: { title: 'Candidates by jurisdiction', data: { kind: 'geo', points: [] } },
};
