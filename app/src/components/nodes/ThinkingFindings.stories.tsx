import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThinkingFindings } from './ThinkingFindings';
const meta: Meta<typeof ThinkingFindings> = { title: 'Trail/ThinkingFindings', component: ThinkingFindings,
  globals: { theme: 'safe-one' }, args: { label: 'Checking your transfer', activeIndex: 1, isComplete: false, steps: [
    { id: 'balances', kind: 'retrieve', label: 'Checking balances across your accounts…', detail: 'You don’t have $50.00 in any single account.', durationMs: 850 },
    { id: 'contacts', kind: 'search', label: 'Looking up Daniel…', detail: 'Found two contacts named Daniel. I need to confirm which one.', durationMs: 850 },
  ] } };
export default meta;
type Story = StoryObj<typeof ThinkingFindings>;
export const Resolving: Story = {};
export const Settled: Story = { args: { isComplete: true } };
