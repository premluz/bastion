import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { SheetHeader } from './SheetHeader';

const meta: Meta<typeof SheetHeader> = { title: 'Shell/SheetHeader', component: SheetHeader };
export default meta;
type Story = StoryObj<typeof SheetHeader>;

export const CloseWithPrimaryCta: Story = {
  args: {
    title: 'Sheet title',
    leading: 'close',
    trailing: <IconButton label="Confirm" variant="primary" icon={<Icon icon="check" />} />,
  },
};

export const BackWithSmallAction: Story = {
  args: { title: 'Filter', leading: 'back', trailing: <Button label="Reset" variant="ghost" size="sm" /> },
};

export const NoTrailing: Story = { args: { title: 'Details', leading: 'close' } };
