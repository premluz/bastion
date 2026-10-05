import type { Meta, StoryObj } from '@storybook/react-vite';
import { HistoryItem } from './HistoryItem';
import { PREVIEW_HISTORY } from './accountPreviewData';
import '../../theme/accounts.css';

const meta: Meta<typeof HistoryItem> = { title: 'Shell/HistoryItem', component: HistoryItem };
export default meta;
type Story = StoryObj<typeof HistoryItem>;
export const Sent: Story = { args: { entry: PREVIEW_HISTORY[0]! } };
export const AppInteraction: Story = { args: { entry: PREVIEW_HISTORY[1]! } };
export const Pending: Story = { args: { entry: PREVIEW_HISTORY[3]! } };
export const Received: Story = { args: { entry: PREVIEW_HISTORY[4]! } };
export const Failed: Story = { args: { entry: PREVIEW_HISTORY[6]! } };
