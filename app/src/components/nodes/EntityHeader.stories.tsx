import type { Meta, StoryObj } from '@storybook/react-vite';
import { EntityHeader } from './EntityHeader';

const meta: Meta<typeof EntityHeader> = {
  title: 'Nodes/EntityHeader',
  component: EntityHeader,
};
export default meta;
type Story = StoryObj<typeof EntityHeader>;

export const Happy: Story = {
  args: {
    data: {
      kind: 'entity',
      entity: {
        id: 'aldergate-estates',
        name: 'Aldergate Estates',
        type: 'Tokenized Real Estate Portfolio',
        attributes: [
          { label: 'Yield', value: '7.2%' },
          { label: 'Outstanding', value: '€62M' },
          { label: 'Distribution frequency', value: 'Quarterly' },
          { label: 'Jurisdiction', value: 'Germany' },
          { label: 'RiskLens score', value: '34/100' },
        ],
      },
    },
    status: { label: 'Renewal pending (12 days)', tone: 'warn' },
  },
};

export const Partial: Story = {
  args: {
    data: {
      kind: 'entity',
      entity: {
        id: 'mira-voss',
        name: 'Mira Voss',
        type: 'Person — Head of Issuance, Fjellbank',
        attributes: [
          { label: 'Role', value: 'Head of Issuance at Fjellbank' },
          { label: 'Associated issuer', value: 'NordBond 2029' },
        ],
      },
    },
  },
};

export const Empty: Story = {
  args: {
    data: {
      kind: 'entity',
      entity: { id: 'unresolved-entity', name: 'Unresolved Entity', type: 'Unknown', attributes: [] },
    },
  },
};
