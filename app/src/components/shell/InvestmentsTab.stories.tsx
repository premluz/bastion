import type { Meta, StoryObj } from '@storybook/react-vite';
import { InvestmentsTab } from './InvestmentsTab';

const meta: Meta<typeof InvestmentsTab> = { title: 'Shell/InvestmentsTab', component: InvestmentsTab };
export default meta;
type Story = StoryObj<typeof InvestmentsTab>;

export const Default: Story = {};
