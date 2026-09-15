import type { Meta, StoryObj } from '@storybook/react-vite';
import { PromoCardFull } from './PromoCardFull';

const meta: Meta<typeof PromoCardFull> = { title: 'Shell/PromoCardFull', component: PromoCardFull };
export default meta;
type Story = StoryObj<typeof PromoCardFull>;
export const Default: Story = { args: { title: 'Put your idle cash to work at 6.4%' } };
export const WithIcon: Story = { args: { title: 'Free premium lounge at airports', icon: '🎁' } };
