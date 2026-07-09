import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeSwitch, type Theme } from './ThemeSwitch';

function ThemeSwitchDemo() {
  const [theme, setTheme] = useState<Theme>('default');
  return <ThemeSwitch theme={theme} onThemeChange={setTheme} />;
}

const meta: Meta<typeof ThemeSwitchDemo> = {
  title: 'Components/ThemeSwitch',
  component: ThemeSwitchDemo,
};

export default meta;
type Story = StoryObj<typeof ThemeSwitchDemo>;

export const Default: Story = {};
