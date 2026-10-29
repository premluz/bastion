import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoiceGlow } from './VoiceGlow';
import styles from './VoiceGlow.stories.module.css';

const meta: Meta<typeof VoiceGlow> = { title: 'Shell/VoiceGlow', component: VoiceGlow };
export default meta;
type Story = StoryObj<typeof VoiceGlow>;

// The bottom of a voice-mode screen, with a made-up voice (there is no microphone in a story).
export const Simulated: Story = {
  render: () => <div className={styles.stage}><VoiceGlow isActive simulate /></div>,
};
