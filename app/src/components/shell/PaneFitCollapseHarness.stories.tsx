import type { Meta, StoryObj } from '@storybook/react-vite';
import { PaneFitCollapseHarness } from './PaneFitCollapseHarness';

// Test-only harness (Phase 18 gate substitute, Prem's ruling 2026-07-26)
// — not a product surface. Exercises usePaneFitCollapse's collapse/
// restore mechanism directly, since no real scenario in the shipped app
// can currently produce a genuine 2-pane fit conflict. See
// PaneFitCollapseHarness.tsx and STATE.md for why.
const meta: Meta<typeof PaneFitCollapseHarness> = {
  title: 'Shell/PaneFitCollapseHarness',
  component: PaneFitCollapseHarness,
};
export default meta;
type Story = StoryObj<typeof PaneFitCollapseHarness>;

export const Default: Story = {};
