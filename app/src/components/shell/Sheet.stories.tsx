import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { Sheet, type SheetSize } from './Sheet';
import { SheetHeader } from './SheetHeader';
import { useSheetStack } from './useSheetStack';

const meta: Meta<typeof Sheet> = {
  title: 'Shell/Sheet',
  component: Sheet,
  decorators: [(Story) => (
    <div style={{ position: 'relative', width: 392, height: 792, overflow: 'hidden', background: 'var(--surface-1)' }}>
      <Story />
    </div>
  )],
};
export default meta;
type Story = StoryObj<typeof Sheet>;

// Single sheet, size + expand demo — drag the handle down to close, up
// to expand (compact/half only; full has nothing further to expand to).
function SingleSheetHarness() {
  const [isOpen, setIsOpen] = useState(true);
  const [size, setSize] = useState<SheetSize>('half');
  if (!isOpen) return <Button label="Open sheet" onClick={() => { setIsOpen(true); setSize('half'); }} />;
  return (
    <Sheet size={size} isExpandable={size !== 'full'} onClose={() => setIsOpen(false)} onExpand={() => setSize('full')} aria-label="Demo sheet">
      <SheetHeader title="Sheet title" leading="close" onLeadingClick={() => setIsOpen(false)}
        trailing={<IconButton label="Confirm" variant="primary" icon={<Icon icon="check" />} onClick={() => setIsOpen(false)} />} />
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Text type="body" color="secondary">Drag the handle down to close, or up to expand.</Text>
        <Text type="supporting" color="secondary">Current size: {size}</Text>
      </div>
    </Sheet>
  );
}
export const Default: Story = { render: () => <SingleSheetHarness /> };

// A small text-button trailing action instead of a filled CTA — "check
// btn as main CTA OR small button," the second of the two header
// patterns this component supports.
function SmallTrailingHarness() {
  const [isOpen, setIsOpen] = useState(true);
  if (!isOpen) return <Button label="Open sheet" onClick={() => setIsOpen(true)} />;
  return (
    <Sheet size="compact" onClose={() => setIsOpen(false)} aria-label="Demo sheet">
      <SheetHeader title="Filter" leading="back" onLeadingClick={() => setIsOpen(false)}
        trailing={<Button label="Reset" variant="ghost" size="sm" onClick={() => {}} />} />
      <div style={{ padding: '0 16px 16px' }}>
        <Text type="body" color="secondary">A compact, non-expandable sheet with a small text CTA.</Text>
      </div>
    </Sheet>
  );
}
export const SmallTrailingAction: Story = { render: () => <SmallTrailingHarness /> };

// Multi-modal: a second sheet pushed on top of the first, which recedes
// (2026-09-16, direct feedback: "multi modal capability") — useSheetStack
// owns the ordered stack; each entry gets a distinct stackIndex so a
// third/fourth sheet would keep layering the same way.
function StackedSheetsHarness() {
  const stack = useSheetStack();
  return (
    <>
      <Button label="Open first sheet" onClick={() => stack.push('first')} />
      {stack.stack.map((entry, index) => {
        const isTop = index === stack.stack.length - 1;
        return (
          <Sheet key={entry.key} size="half" stackIndex={index} isReceded={!isTop}
            onClose={stack.pop} aria-label={`${entry.id} sheet`}>
            <SheetHeader title={entry.id === 'first' ? 'First sheet' : 'Second sheet'} leading="close" onLeadingClick={stack.pop}
              trailing={entry.id === 'first'
                ? <Button label="Open another" variant="ghost" size="sm" onClick={() => stack.push('second')} />
                : undefined} />
            <div style={{ padding: '0 16px 16px' }}>
              <Text type="body" color="secondary">
                {entry.id === 'first' ? 'Tap "Open another" to push a second sheet on top.' : 'This sheet sits above the first, which is now receded.'}
              </Text>
            </div>
          </Sheet>
        );
      })}
    </>
  );
}
export const StackedSheets: Story = { render: () => <StackedSheetsHarness /> };
