import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Dialog } from '@astryxdesign/core/Dialog';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Heading } from '@astryxdesign/core/Heading';
import styles from './AccountExperience.module.css';

export function AccountSheet({ isOpen, title, onClose, onBack, onPresenceChange, children }: {
  isOpen: boolean; title: string; onClose: () => void; onBack: () => void; onPresenceChange: (present: boolean) => void; children: ReactNode;
}) {
  const [present, setPresent] = useState(isOpen);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => onPresenceChange(present), [present, onPresenceChange]);
  useEffect(() => {
    if (isOpen) { setPresent(true); return; }
    let cancelled = false;
    const animations = ref.current?.getAnimations() ?? [];
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (!cancelled) setPresent(false);
    });
    return () => { cancelled = true; };
  }, [isOpen]);
  return <Dialog ref={ref} isOpen={present} onOpenChange={(open) => { if (!open) onClose(); }}
    variant="fullscreen" padding={0} className={styles.sheet} data-closing={!isOpen} aria-label={title}>
    <div className={styles.handle} />
    <header className={styles.sheetHeader}>
      <IconButton label="Back" icon={<Icon icon="chevronLeft" />} variant="ghost" onClick={onBack} />
      <Heading level={1} type="display-3">{title}</Heading>
      <IconButton label="Close account sheet" icon={<Icon icon="close" />} variant="ghost" onClick={onClose} />
    </header>
    <div className={styles.sheetBody}>{children}</div>
  </Dialog>;
}
