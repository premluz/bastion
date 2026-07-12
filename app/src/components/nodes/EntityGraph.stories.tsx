import type { Meta, StoryObj } from '@storybook/react-vite';
import { EntityGraph } from './EntityGraph';

const meta: Meta<typeof EntityGraph> = {
  title: 'Nodes/EntityGraph',
  component: EntityGraph,
  decorators: [(Story) => <div style={{ width: 640 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof EntityGraph>;

// Aldergate Estates relationship map (issuer-dossier fixture data).
export const Happy: Story = {
  args: {
    title: 'Relationship map',
    data: {
      kind: 'graph',
      nodes: [
        { id: 'aldergate-estates', label: 'Aldergate Estates', x: 400, y: 300, group: 'asset' },
        { id: 'nordkap-assurance', label: 'Nordkap Assurance', x: 400, y: 100, group: 'auditor' },
        { id: 'solent-custody', label: 'Solent Custody', x: 650, y: 300, group: 'custodian' },
        { id: 'meridian-capital-partners', label: 'Meridian Capital Partners', x: 150, y: 200, group: 'holder' },
        { id: 'nordkap-pension-trust', label: 'Nordkap Pension Trust', x: 120, y: 350, group: 'holder' },
        { id: 'rhein-family-office', label: 'Rhein Family Office', x: 180, y: 480, group: 'holder' },
      ],
      edges: [
        { source: 'aldergate-estates', target: 'nordkap-assurance', label: 'audited by' },
        { source: 'aldergate-estates', target: 'solent-custody', label: 'custodied at' },
        { source: 'aldergate-estates', target: 'meridian-capital-partners', label: 'held by' },
        { source: 'aldergate-estates', target: 'nordkap-pension-trust', label: 'held by' },
        { source: 'aldergate-estates', target: 'rhein-family-office', label: 'held by' },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    title: 'Relationship map',
    data: {
      kind: 'graph',
      nodes: [
        { id: 'aldergate-estates', label: 'Aldergate Estates', x: 300, y: 200, group: 'asset' },
        { id: 'solent-custody', label: 'Solent Custody', x: 550, y: 200, group: 'custodian' },
      ],
      edges: [{ source: 'aldergate-estates', target: 'solent-custody', label: 'custodied at' }],
    },
  },
};

// GraphDataSetSchema requires at least one node — the smallest legitimate
// state is one isolated entity with no relationships yet resolved, not a
// literal zero-node empty state.
export const Empty: Story = {
  args: {
    title: 'Relationship map',
    data: {
      kind: 'graph',
      nodes: [{ id: 'aldergate-estates', label: 'Aldergate Estates', x: 300, y: 200, group: 'asset' }],
      edges: [],
    },
  },
};
