import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepRow } from './StepRow';

const meta: Meta<typeof StepRow> = {
  title: 'Trail/StepRow',
  component: StepRow,
};
export default meta;
type Story = StoryObj<typeof StepRow>;

// isLast defaults to true on every isolated single-row story below — a
// mid-trail row rendered alone would otherwise draw a rail segment
// reaching toward a sibling that doesn't exist in this story's DOM.
export const Active: Story = {
  args: {
    isActive: true,
    isLast: true,
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
    isLast: true,
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
    isLast: true,
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

export const SearchWithResults: Story = {
  args: {
    isActive: true,
    isLast: true,
    step: {
      id: 'search',
      kind: 'search',
      label: 'AI agent competitive UX research tool Figma screenshots 2026',
      durationMs: 1400,
      webResults: [
        { id: '1', title: '9 Best AI Tools for UI/UX Designers in 2026: Deep Dive', domain: 'www.toools.design' },
        { id: '2', title: 'Use AI tools in Figma Design – Figma Learn - Help Center', domain: 'help.figma.com' },
        { id: '3', title: '11 AI Competitor Analysis Tools for Product Teams | Figma', domain: 'www.figma.com' },
        { id: '4', title: '10 Best AI Tools for UX Designers in 2026 | by Tech with Eldad', domain: 'medium.muz.li' },
      ],
    },
  },
};
