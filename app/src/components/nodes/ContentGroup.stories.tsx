import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContentGroup } from './ContentGroup';
const meta: Meta<typeof ContentGroup> = { title: 'Nodes/ContentGroup', component: ContentGroup,
  globals: { theme: 'safe-one' }, args: { title: 'Trending', href: '#trending', layout: 'rows', children: 'Reusable group content' } };
export default meta;
type Story = StoryObj<typeof ContentGroup>;
export const Default: Story = {};
export const WithoutLink: Story = { args: { href: '' } };
