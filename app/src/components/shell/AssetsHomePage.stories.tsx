import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssetsHomePage } from './AssetsHomePage';

// One story per currently-registered theme (.storybook/preview.ts's own
// globalTypes.theme.items list, re-checked rather than trusted from
// CLAUDE.md text per this task's own instruction) — default, ops-dark,
// glass, glass-light, safe-one. The prior TabBar/AssistantOrb session
// narrowed ITS OWN stories to safe-one only per Prem's explicit scoping
// for that session; this page's own brief asks for full theme coverage,
// so that narrowing isn't carried forward here.
const meta = {
  title: 'Shell/AssetsHomePage',
  component: AssetsHomePage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Home tab preview — glow header, balance, action row, segmented crypto/earn/nfts list. Wired into MobileShellPreview as the Home destination. Universe data is a minimal Phase-3 seed (5 crypto holdings), not full Phase 1 universe content.' } },
  },
} satisfies Meta<typeof AssetsHomePage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { globals: { theme: 'default' } };
export const OpsDark: Story = { globals: { theme: 'ops-dark' } };
export const Glass: Story = { globals: { theme: 'glass' } };
export const GlassLight: Story = { globals: { theme: 'glass-light' } };
export const SafeOne: Story = { globals: { theme: 'safe-one' } };
