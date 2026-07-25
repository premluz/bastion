import type { Meta, StoryObj } from '@storybook/react-vite';
import { SceneSummary } from './SceneSummary';

const meta: Meta<typeof SceneSummary> = {
  title: 'Nodes/SceneSummary',
  component: SceneSummary,
};
export default meta;
type Story = StoryObj<typeof SceneSummary>;

// Literal-prop node: "Happy/Partial/Empty" are representative value
// variations, not missing-data states (no bind, same convention as
// ConfidenceMeter/Recommendation's own three stories) — content drawn
// from the real issuer-dossier fixture for authenticity.
export const Happy: Story = {
  args: {
    recommendation: 'Size the Aldergate Estates position, but gate settlement on audit confirmation.',
    confidence: 0.58,
    confidenceLabel: 'Forward-looking confidence',
    sourceRefs: ['IssuerRegistry', 'CustodyGrid', 'PortfolioAtlas'],
    assumptions: ['Distribution continuity through the current quarter holds absent a contrary IssuerRegistry filing.'],
    caveat: 'History confidence is high (0.86); this recommendation carries the lower forward-looking confidence pending IssuerRegistry’s audit update.',
  },
};

export const Partial: Story = {
  args: {
    recommendation: 'Aldergate Estates and Helios Yield Fund both clear the refined mandate; Vantara Metals is excluded on jurisdiction.',
    confidence: 0.83,
    confidenceLabel: 'Refined-mandate confidence',
    sourceRefs: ['CompliancePulse', 'IssuerRegistry'],
  },
};

export const Empty: Story = {
  args: {
    recommendation: 'No recommendation yet — awaiting IssuerRegistry confirmation.',
    confidence: 0.32,
    confidenceLabel: 'Confidence',
    sourceRefs: [],
  },
};
