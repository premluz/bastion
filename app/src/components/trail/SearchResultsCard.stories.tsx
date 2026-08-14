import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchResultsCard } from './SearchResultsCard';

const meta: Meta<typeof SearchResultsCard> = {
  title: 'Trail/SearchResultsCard',
  component: SearchResultsCard,
};
export default meta;
type Story = StoryObj<typeof SearchResultsCard>;

export const Happy: Story = {
  args: {
    results: [
      { id: '1', title: '9 Best AI Tools for UI/UX Designers in 2026: Deep Dive', domain: 'www.toools.design' },
      { id: '2', title: 'Use AI tools in Figma Design – Figma Learn - Help Center', domain: 'help.figma.com' },
      { id: '3', title: '11 AI Competitor Analysis Tools for Product Teams | Figma', domain: 'www.figma.com' },
      { id: '4', title: '10 Best AI Tools for UX Designers in 2026 | by Tech with Eldad', domain: 'medium.muz.li' },
      { id: '5', title: 'Top 10 AI UX Research Tools I Use as an APM (2026)', domain: 'www.banani.co' },
    ],
  },
};

export const Partial: Story = {
  args: {
    results: [{ id: '1', title: 'Best Mobbin Alternatives & Competitors', domain: 'www.positioniseverything.net' }],
  },
};

export const Empty: Story = {
  args: {
    results: [],
  },
};
