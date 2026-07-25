import type { Meta, StoryObj } from '@storybook/react-vite';
import { NewsFeed } from './NewsFeed';

const meta: Meta<typeof NewsFeed> = {
  title: 'Nodes/NewsFeed',
  component: NewsFeed,
  decorators: [(Story) => <div style={{ width: 480 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof NewsFeed>;

// Aldergate Estates coverage — real texture tied to the existing audit-
// lapse fact (issuer-dossier fixture), not invented filler.
export const Happy: Story = {
  args: {
    title: 'Coverage',
    data: {
      kind: 'table',
      columns: [
        { key: 'headline', label: 'Headline', type: 'string' },
        { key: 'dek', label: 'Dek', type: 'string' },
        { key: 'source', label: 'Source', type: 'string' },
        { key: 'date', label: 'Date', type: 'date' },
      ],
      rows: [
        {
          headline: "Aldergate Estates' audit renewal still pending as Q3 distribution nears",
          dek: 'Eight consecutive quarters paid, but IssuerRegistry has yet to log the renewal filing.',
          source: 'IssuerRegistry',
          date: '2026-07-14',
        },
        {
          headline: 'Berlin commercial portfolio holds steady at 7.2% amid broader EU real estate softening',
          dek: 'Aldergate outpaces the regional benchmark for the third straight quarter.',
          source: 'MarketTape',
          date: '2026-07-02',
        },
        {
          headline: "Nordkap Assurance reconfirmed as Aldergate's sole auditor for FY2026",
          dek: 'No auditor change filed despite the open renewal question.',
          source: 'IssuerRegistry',
          date: '2026-06-20',
        },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    title: 'Coverage',
    data: {
      kind: 'table',
      columns: [
        { key: 'headline', label: 'Headline', type: 'string' },
        { key: 'dek', label: 'Dek', type: 'string' },
        { key: 'source', label: 'Source', type: 'string' },
        { key: 'date', label: 'Date', type: 'date' },
      ],
      rows: [
        {
          headline: "Aldergate Estates' audit renewal still pending as Q3 distribution nears",
          dek: 'Eight consecutive quarters paid, but IssuerRegistry has yet to log the renewal filing.',
          source: 'IssuerRegistry',
          date: '2026-07-14',
        },
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    title: 'Coverage',
    data: {
      kind: 'table',
      columns: [
        { key: 'headline', label: 'Headline', type: 'string' },
        { key: 'dek', label: 'Dek', type: 'string' },
        { key: 'source', label: 'Source', type: 'string' },
        { key: 'date', label: 'Date', type: 'date' },
      ],
      rows: [],
    },
  },
};
