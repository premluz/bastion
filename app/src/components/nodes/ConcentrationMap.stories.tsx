import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConcentrationMap } from './ConcentrationMap';

const meta: Meta<typeof ConcentrationMap> = {
  title: 'Nodes/ConcentrationMap',
  component: ConcentrationMap,
  decorators: [(Story) => <div style={{ width: 560 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof ConcentrationMap>;

// Aldergate's real holder-concentration breakdown (issuer-dossier), order
// preserved as authored — Meridian Capital Partners is the single largest
// named holder, flagged per "what dominates this whole?"
export const Happy: Story = {
  args: {
    title: 'Top holder concentration',
    labelColumn: 'holder',
    valueColumn: 'share',
    valueSuffix: '%',
    highlightValue: 'Meridian Capital Partners',
    data: {
      kind: 'table',
      columns: [
        { key: 'holder', label: 'Holder', type: 'string' },
        { key: 'share', label: 'Share', type: 'number' },
      ],
      rows: [
        { holder: 'Meridian Capital Partners', share: 18 },
        { holder: 'Nordkap Pension Trust', share: 12 },
        { holder: 'Rhein Family Office', share: 9 },
        { holder: 'Other holders', share: 61 },
      ],
    },
  },
};

// One row too small to fit a label at this width — legibility floor
// working: its cell renders with no text, not overflowing/clipped text.
export const Partial: Story = {
  args: {
    title: 'Top holder concentration',
    labelColumn: 'holder',
    valueColumn: 'share',
    valueSuffix: '%',
    data: {
      kind: 'table',
      columns: [
        { key: 'holder', label: 'Holder', type: 'string' },
        { key: 'share', label: 'Share', type: 'number' },
      ],
      rows: [
        { holder: 'Meridian Capital Partners', share: 82 },
        { holder: 'Nordkap Pension Trust', share: 1 },
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    title: 'Top holder concentration',
    labelColumn: 'holder',
    valueColumn: 'share',
    data: {
      kind: 'table',
      columns: [
        { key: 'holder', label: 'Holder', type: 'string' },
        { key: 'share', label: 'Share', type: 'number' },
      ],
      rows: [],
    },
  },
};
