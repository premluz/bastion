import type { Meta, StoryObj } from '@storybook/react-vite';
import ethLogo from '../../assets/coin-logos/eth.svg';
import { PromoCardFull } from './PromoCardFull';

const meta: Meta<typeof PromoCardFull> = { title: 'Shell/PromoCardFull', component: PromoCardFull };
export default meta;
type Story = StoryObj<typeof PromoCardFull>;
export const Default: Story = { args: { title: 'Put your idle cash to work at 6.4%' } };
export const WithIcon: Story = { args: { title: 'Free premium lounge at airports', icon: '🎁' } };
// Reuses an existing real asset (the ETH mark) just to exercise the
// backgroundImage mechanism (2026-09-16) — not a promo asset in its own
// right; a real promo background image is still pending, same "no
// fabricated imagery" posture as VirtualCardPlaceholder/PromoCard.
export const WithBackgroundImage: Story = { args: { title: 'Trade ETH commission-free', backgroundImage: ethLogo } };
