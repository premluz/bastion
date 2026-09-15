import type { Meta, StoryObj } from '@storybook/react-vite';
import { PromoCarousel } from './PromoCarousel';
import { PromoCardFull } from './PromoCardFull';

const meta: Meta<typeof PromoCarousel> = { title: 'Shell/PromoCarousel', component: PromoCarousel };
export default meta;
type Story = StoryObj<typeof PromoCarousel>;

const PROMOS = [
  { id: 'offers', title: 'Explore offers and earn' },
  { id: 'idle-cash', title: 'Put your idle cash to work at 6.4%' },
  { id: 'lounge', title: 'Free premium lounge at airports', icon: '🎁' },
] as const;

export const Default: Story = {
  args: {
    'aria-label': 'Promotions',
    children: PROMOS.map((promo) => (
      <PromoCardFull key={promo.id} title={promo.title} {...('icon' in promo ? { icon: promo.icon } : {})} />
    )),
  },
};
