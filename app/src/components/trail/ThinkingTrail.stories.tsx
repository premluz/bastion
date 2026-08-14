import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThinkingTrail } from './ThinkingTrail';
import type { ThinkingStep } from '../../contracts/thinking';

const meta: Meta<typeof ThinkingTrail> = {
  title: 'Trail/ThinkingTrail',
  component: ThinkingTrail,
};
export default meta;
type Story = StoryObj<typeof ThinkingTrail>;

const BASE_STEPS: ThinkingStep[] = [
  { id: 'plan', kind: 'plan', label: 'Parsing mandate constraints — yield floor, conservative risk tolerance', durationMs: 900 },
  {
    id: 'search',
    kind: 'search',
    label: 'AI agent competitive UX research tool Figma screenshots 2026',
    durationMs: 1100,
    webResults: [
      { id: '1', title: '9 Best AI Tools for UI/UX Designers in 2026: Deep Dive', domain: 'www.toools.design' },
      { id: '2', title: 'Use AI tools in Figma Design – Figma Learn - Help Center', domain: 'help.figma.com' },
      { id: '3', title: '11 AI Competitor Analysis Tools for Product Teams | Figma', domain: 'www.figma.com' },
      { id: '4', title: '10 Best AI Tools for UX Designers in 2026 | by Tech with Eldad', domain: 'medium.muz.li' },
    ],
  },
  {
    id: 'retrieve',
    kind: 'retrieve',
    label: 'Pulling risk, liquidity, and jurisdiction data for candidates',
    durationMs: 1400,
    sources: [
      { name: 'RiskLens', ref: 'risk-scores' },
      { name: 'PortfolioAtlas', ref: 'mandate-terms' },
    ],
  },
  {
    id: 'synthesize',
    kind: 'synthesize',
    label: 'Weighing yield against risk concentration and audit status',
    durationMs: 1600,
    confidence: 0.74,
  },
];

// Mid-trail: second step (search) active, indicator pulsing at the top
// simultaneously with the active row's own pulse — the confirmed dual-
// animation exception to node-vocabulary.md principle 5.
export const Running: Story = {
  args: {
    steps: BASE_STEPS,
    activeIndex: 0,
    isComplete: false,
    elapsedMs: 900,
    skip: () => {},
  },
};

// Active step is the search step — results card visible mid-trail.
export const SearchStepExpanded: Story = {
  args: {
    steps: BASE_STEPS,
    activeIndex: 1,
    isComplete: false,
    elapsedMs: 2000,
    skip: () => {},
  },
};

// Trail finished — Collapsible with the synthetic Done row as the last
// item, rail terminating cleanly with no trailing segment.
export const Complete: Story = {
  args: {
    steps: BASE_STEPS,
    activeIndex: BASE_STEPS.length - 1,
    isComplete: true,
    elapsedMs: 5000,
    skip: null,
  },
};
