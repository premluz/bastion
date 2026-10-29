import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActivityOrb, type ActivityOrbSize, type ActivityOrbVariant } from './ActivityOrb';
import styles from './ActivityOrb.stories.module.css';

const meta: Meta<typeof ActivityOrb> = { title: 'Trail/ActivityOrb', component: ActivityOrb };
export default meta;
type Story = StoryObj<typeof ActivityOrb>;

const VARIANTS: readonly ActivityOrbVariant[] = ['S1', 'S2', 'G1'];
const SIZES: readonly ActivityOrbSize[] = ['sm', 'md', 'lg'];

// Both variants at every size.
export const Variants: Story = {
  render: () => (
    <div className={styles.grid}>
      {VARIANTS.map((variant) => (
        <div key={variant} className={styles.row}>
          <span className={styles.name}>{variant}</span>
          {SIZES.map((size) => <ActivityOrb key={size} variant={variant} size={size} />)}
        </div>
      ))}
    </div>
  ),
};

// Beside a status line, in the line's own ink.
export const Inline: Story = {
  render: () => (
    <div className={styles.grid}>
      <div className={styles.status}><ActivityOrb variant="S1" /> Thinking…</div>
      <div className={styles.status}><ActivityOrb variant="S2" /> Thinking…</div>
      <div className={styles.status}><ActivityOrb variant="G1" /> Processing…</div>
    </div>
  ),
};
