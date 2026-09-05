import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrendChart } from './TrendChart';
import { TradableAssetSchema } from '../../contracts/tradableAsset';
import equityJson from '../../../universe/fixtures/equity-example.json';
import cryptoJson from '../../../universe/fixtures/crypto-example.json';

// Parsed through the real schema, not just imported as JSON — gives
// correctly-typed `periods` (a literal union, not widened to string[])
// with zero casting, and doubles as a live check that the fixture stays
// valid if it's ever edited.
const equity = TradableAssetSchema.parse(equityJson);
const crypto = TradableAssetSchema.parse(cryptoJson);

const meta: Meta<typeof TrendChart> = {
  title: 'Nodes/TrendChart',
  component: TrendChart,
  decorators: [(Story) => <div style={{ width: '600px' }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof TrendChart>;

// Literal-prop node: content drawn from the real South Bow Corp fixture
// (universe/fixtures/equity-example.json), including its authored
// compareSeries. Fixed-width story wrapper (merlin-new-node skill §2),
// same reasoning as EarningsHistoryChart's own story.
export const Happy: Story = {
  args: {
    title: 'Price',
    series: equity.trendChart.series,
    periods: equity.trendChart.periods,
    compareSeries: equity.trendChart.compareSeries,
  },
};

// No compareSeries — genuinely absent, not every asset carries a
// comparison line.
export const Partial: Story = {
  args: {
    title: 'Price',
    series: crypto.trendChart.series,
    periods: crypto.trendChart.periods,
  },
};

export const Empty: Story = {
  args: {
    title: 'Price',
    series: [{ t: '2026-07-02', price: 40.33 }],
    periods: ['MAX'],
  },
};
