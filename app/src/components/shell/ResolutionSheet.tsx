import { useEffect, useRef, useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import { buildResolutionScene, type AttentionItem } from '../../engine/attentionQueue';
import { isApprovalCardLoaded, preloadApprovalCard } from '../../registry/registry';
import { Sheet } from './Sheet';
import styles from './ResolutionSheet.module.css';

export interface ResolutionSheetProps {
  item: AttentionItem;
  onClose: () => void;
  onConfirm: (choice: string) => void;
}

// An attention item's full view (2026-10-23, direct feedback with a mock): the context, then
// the choices straight away — no intermediate "Later / Resolve" step. Nothing is nested
// (2026-10-26, direct feedback): a header, a description that is the question, the choices as
// bare rows, and Confirm at the foot; the sheet is as tall as that needs. Confirm hands the
// chosen one to the assistant.
export function ResolutionSheet({ item, onClose, onConfirm }: ResolutionSheetProps) {
  const [choice, setChoice] = useState('');
  // The sheet is as tall as its content, so it opens only once the choices can render in its first frame:
  // normally at once (AttentionSection loads the card ahead), else after the code arrives.
  const [ready, setReady] = useState(isApprovalCardLoaded);
  useEffect(() => {
    if (ready) return;
    preloadApprovalCard().then(() => setReady(true), (error: unknown) => {
      setReady(true);
      console.error('Loading the question card failed.', error);
    });
  }, [ready]);
  // Confirm plays the sheet's own exit first and hands the choice over once it has left, so
  // the item's removal never cuts the sheet off mid-air.
  const confirmed = useRef<string | null>(null);
  const settle = () => { if (confirmed.current) onConfirm(confirmed.current); else onClose(); };
  if (!ready) return null;
  return (
    <Sheet isFloating size="auto" onClose={settle} aria-label={item.title}>
      {(close) => <>
        <div className={styles.root}>
          <div className={styles.context}>
            <Heading level={2} type="display-3">{item.title}</Heading>
            <Text type="body" color="secondary">{item.question}</Text>
          </div>
          {/* The question card reports a choice through its data attribute (rule 7). */}
          <div onChange={(event) => {
            if (!(event.target instanceof Element)) return;
            const value = event.target.closest('[data-approval-card]')?.getAttribute('data-approval-value');
            if (value) setChoice(value);
          }}>
            <SceneRenderer scene={buildResolutionScene(item, choice)} />
          </div>
          <Button label="Confirm" variant="primary" className={styles.confirm} isDisabled={!choice}
            onClick={() => { confirmed.current = choice; close(); }} />
        </div>
      </>}
    </Sheet>
  );
}
