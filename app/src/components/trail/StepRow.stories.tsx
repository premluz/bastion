import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepRow } from './StepRow';

const meta: Meta<typeof StepRow> = {
  title: 'Trail/StepRow',
  component: StepRow,
};
export default meta;
type Story = StoryObj<typeof StepRow>;

export const Active: Story = {
  args: {
    isActive: true,
    step: {
      id: 'search',
      kind: 'search',
      label: 'Scanning listed assets above the 6% yield threshold',
      durationMs: 1100,
      sources: [{ name: 'MarketTape', ref: 'live-price-feed' }],
    },
  },
};

export const Settled: Story = {
  args: {
    isActive: false,
    step: {
      id: 'synthesize',
      kind: 'synthesize',
      label: 'Weighing yield against risk concentration and audit status',
      durationMs: 1600,
      confidence: 0.74,
    },
  },
};

export const WithDetailAndSources: Story = {
  args: {
    isActive: false,
    step: {
      id: 'retrieve',
      kind: 'retrieve',
      label: 'Pulling risk, liquidity, and jurisdiction data for candidates',
      detail: 'Cross-referencing three candidates against the conservative mandate.',
      durationMs: 1400,
      sources: [
        { name: 'RiskLens', ref: 'risk-scores' },
        { name: 'PortfolioAtlas', ref: 'mandate-terms' },
      ],
    },
  },
};
