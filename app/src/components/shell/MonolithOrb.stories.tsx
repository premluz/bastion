import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../theme/pill-navigation.css';
import { MonolithOrb } from './MonolithOrb';
import styles from './MonolithOrb.stories.module.css';

// The Bastion monolith as the assistant orb. Theme comes from the toolbar: light themes render the
// glass body, dark themes the graphite one. Real size is the navigation's + slot; Large is for inspecting.
const meta: Meta<typeof MonolithOrb> = {
  title: 'Shell/MonolithOrb',
  component: MonolithOrb,
  parameters: { layout: 'centered' },
  args: { working: false },
  decorators: [(Story) => <div className={styles.slot}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof MonolithOrb>;

export const Rest: Story = {};
export const Working: Story = { args: { working: true } };
export const LargeRest: Story = {
  decorators: [(Story) => <div className={styles.large}><Story /></div>],
};
export const LargeWorking: Story = {
  args: { working: true },
  decorators: [(Story) => <div className={styles.large}><Story /></div>],
};
