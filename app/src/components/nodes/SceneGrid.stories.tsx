import type { Meta, StoryObj } from '@storybook/react-vite';
import { SceneGrid } from './SceneGrid';

const meta: Meta<typeof SceneGrid> = {
  title: 'Nodes/SceneGrid',
  component: SceneGrid,
};
export default meta;
type Story = StoryObj<typeof SceneGrid>;

function Block({ label }: { label: string }) {
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        color: 'var(--ink-primary)',
        padding: 'var(--space-16)',
        borderRadius: 'var(--radius-8)',
      }}
    >
      {label}
    </div>
  );
}

export const Happy: Story = {
  args: {
    columns: 3,
    children: (
      <>
        <Block label="Panel A" />
        <Block label="Panel B" />
        <Block label="Panel C" />
      </>
    ),
  },
};

export const Partial: Story = {
  args: {
    columns: 3,
    children: <Block label="Panel A" />,
  },
};

export const Empty: Story = {
  args: {
    columns: 3,
    children: undefined,
  },
};
