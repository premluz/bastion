import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from '@astryxdesign/core/Text';
import { PillNavigation, type PillNavigationProps } from './PillNavigation';
import styles from './PillNavigation.module.css';

// The composer's own UI is a full-screen overlay now (ComposerModeOverlay.tsx,
// 2026-09-16 follow-up), mounted at MobileFrame.tsx's own level — this
// story previews PillNavigation in isolation, so isComposerOpen is just a
// plain arg here (drives the dock's own halo/fade), not backed by a real
// composer body the way it was before that overlay existed.
function Preview(args: PillNavigationProps) {
  const [activeItem, setActiveItem] = useState(args.activeItem);
  const [isOpen, setIsOpen] = useState(args.isActionsOpen);
  const [action, setAction] = useState('');
  const [composerOpen, setComposerOpen] = useState(args.isComposerOpen ?? false);
  useEffect(() => setComposerOpen(args.isComposerOpen ?? false), [args.isComposerOpen]);
  useEffect(() => setActiveItem(args.activeItem), [args.activeItem]);
  useEffect(() => setIsOpen(args.isActionsOpen), [args.isActionsOpen]);
  return <div className={styles.stage}><div className={styles.phone}>
    <main className={styles.content} aria-label="Navigation preview"><Text role="status" color="secondary">{action}</Text></main>
    <PillNavigation activeItem={activeItem} onNavigate={(item) => {
      setActiveItem(item); setAction(''); setComposerOpen(item === 'assistant' ? !composerOpen : false);
    }} isComposerOpen={composerOpen}
      isActionsOpen={isOpen} onActionsOpenChange={setIsOpen} onAction={(item) => setAction(`${item} selected`)} />
  </div></div>;
}

const meta: Meta<typeof PillNavigation> = { title: 'Shell/PillNavigation', component: PillNavigation,
  parameters: { layout: 'fullscreen' }, args: { activeItem: 'home', isActionsOpen: false }, render: (args) => <Preview {...args} /> };
export default meta;
type Story = StoryObj<typeof PillNavigation>;
export const Default: Story = {};
export const Explore: Story = { args: { activeItem: 'explore' } };
export const Assets: Story = { args: { activeItem: 'assets' } };
export const Assistant: Story = { args: { activeItem: 'assistant' } };
export const ActionsOpen: Story = { args: { isActionsOpen: true } };
export const ComposerOpen: Story = { args: { activeItem: 'assistant', isComposerOpen: true } };
