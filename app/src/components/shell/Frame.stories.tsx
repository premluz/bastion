import type { Meta, StoryObj } from '@storybook/react-vite';
import { Frame } from './Frame';
import { isTheme } from '../ThemeSwitch/ThemeSwitch';

const meta: Meta<typeof Frame> = {
  title: 'Shell/Frame',
  component: Frame,
  render: (_args, context) => {
    const globalTheme = context.globals.theme;
    const initialTheme = typeof globalTheme === 'string' && isTheme(globalTheme) ? globalTheme : 'default';
    return <Frame initialTheme={initialTheme} />;
  },
};
export default meta;
type Story = StoryObj<typeof Frame>;

export const Default: Story = {};
