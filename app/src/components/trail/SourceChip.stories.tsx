import type { Meta, StoryObj } from '@storybook/react-vite';
import { SourceChip } from './SourceChip';

const meta: Meta<typeof SourceChip> = {
  title: 'Trail/SourceChip',
  component: SourceChip,
};
export default meta;
type Story = StoryObj<typeof SourceChip>;

export const Default: Story = {
  args: { name: 'CustodyGrid' },
};
