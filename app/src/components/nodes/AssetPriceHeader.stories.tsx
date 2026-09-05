import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssetPriceHeader } from './AssetPriceHeader';

const meta: Meta<typeof AssetPriceHeader> = {
  title: 'Nodes/AssetPriceHeader',
  component: AssetPriceHeader,
};
export default meta;
type Story = StoryObj<typeof AssetPriceHeader>;

// Literal-prop node: "Happy/Partial/Empty" are representative value
// variations, not missing-data states (no bind, same convention as
// RingGauge/AnalystConsensus's own stories) — Happy drawn from the real
// South Bow Corp fixture (universe/fixtures/equity-example.json) for
// authenticity.
export const Happy: Story = {
  args: {
    lastPrice: 40.33,
    changeAbs: 0.07,
    changePct: 0.17,
    asOf: '2026-07-02',
    afterHours: { price: 40.29, changeAbs: -0.04, changePct: -0.1, asOf: '2026-07-02T20:15:00Z' },
    dayRange: [40.11, 40.42],
  },
};

// No after-hours read — genuinely absent, not a missing-data placeholder
// (crypto-native assets trade continuously and never carry one).
export const Partial: Story = {
  args: {
    lastPrice: 4.95,
    changeAbs: 1.44,
    changePct: 41.03,
    asOf: '2026-07-02',
    dayRange: [3.6, 4.98],
  },
};

// A down day — confirms the alert-tone delta path renders correctly, not
// just the happy-path ok tone.
export const Empty: Story = {
  args: {
    lastPrice: 38.12,
    changeAbs: -1.4,
    changePct: -3.54,
    asOf: '2026-06-08',
    dayRange: [37.9, 39.5],
  },
};
