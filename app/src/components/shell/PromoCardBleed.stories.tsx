import type { Meta, StoryObj } from '@storybook/react-vite';
import { PromoCardBleed } from './PromoCardBleed';
import { PromoCarousel } from './PromoCarousel';

// Full-bleed banner (2026-10-10). Shown inside the carousel's `bleed` variant,
// which is what makes it run edge to edge of the screen.
const meta: Meta<typeof PromoCardBleed> = { title: 'Shell/PromoCardBleed', component: PromoCardBleed, parameters: { layout: 'fullscreen' } };
export default meta;
type Story = StoryObj<typeof PromoCardBleed>;

export const Default: Story = {
  args: { title: 'DeFi opportunities', eyebrow: 'Lend Earn Grow', cta: 'Explore', image: '/images/hero-promo.jpg' },
};

export const WithoutCall: Story = {
  args: { title: 'Free premium lounge at airports', image: '/images/card03.jpg' },
};

export const Carousel: StoryObj<typeof PromoCarousel> = {
  render: () => (
    <PromoCarousel aria-label="Promotions" variant="bleed">
      <PromoCardBleed title="DeFi opportunities" eyebrow="Lend Earn Grow" cta="Explore" image="/images/hero-promo.jpg" />
      <PromoCardBleed title="Put your idle cash to work at 6.4%" eyebrow="Earn" cta="Learn more" image="/images/card02.jpg" />
      <PromoCardBleed title="Free premium lounge at airports" eyebrow="Perks" cta="See perks" image="/images/card03.jpg" />
    </PromoCarousel>
  ),
};
