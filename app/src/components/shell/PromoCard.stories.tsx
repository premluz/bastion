import type { Meta, StoryObj } from '@storybook/react-vite';
import { PromoCard } from './PromoCard';

const meta: Meta<typeof PromoCard> = { title: 'Shell/PromoCard', component: PromoCard };
export default meta;
type Story = StoryObj<typeof PromoCard>;

export const Placeholder: Story = { args: { title: 'Explore offers and earn' } };
export const WithIcon: Story = { args: { title: 'Free premium lounge at airports', icon: '🎁' } };
