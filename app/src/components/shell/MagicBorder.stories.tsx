import type { Meta, StoryObj } from '@storybook/react-vite';
import { MagicBorder, type MagicBorderPalette, type MagicBorderVariant } from './MagicBorder';
import styles from './MagicBorder.stories.module.css';

const meta: Meta<typeof MagicBorder> = { title: 'Shell/MagicBorder', component: MagicBorder };
export default meta;
type Story = StoryObj<typeof MagicBorder>;

const PALETTES: readonly MagicBorderPalette[] = ['spectrum', 'brand', 'prismatic'];

function Sample({ variant, palette }: { variant: MagicBorderVariant; palette: MagicBorderPalette }) {
  return (
    <MagicBorder isActive variant={variant} palette={palette} className={styles.frame}>
      <div className={styles.pane}>{palette}</div>
    </MagicBorder>
  );
}

const grid = (variant: MagicBorderVariant) => (
  <div className={styles.grid}>{PALETTES.map((palette) => <Sample key={palette} variant={variant} palette={palette} />)}</div>
);

// The three palettes, each in both shapes.
export const Bottom: Story = { render: () => grid('bottom') };
export const Rim: Story = { render: () => grid('rim') };
