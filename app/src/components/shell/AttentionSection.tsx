import { useEffect, type TransitionEvent } from 'react';
import { AttentionCard } from './AttentionCard';
import { CaughtUpCard } from './CaughtUpCard';
import { PromoCarousel } from './PromoCarousel';
import { SuggestionList } from './SuggestionList';
import { PULSE_ITEMS } from '../../engine/attentionQueue';
import { preloadApprovalCard } from '../../registry/registry';
import type { AttentionQueue } from './useAttentionQueue';
import '../../theme/attention.css';
import styles from './AttentionSection.module.css';

// The attention home's body (2026-10-23, direct feedback with a mock): the queue as a
// carousel — swiping only browses, it never dismisses (vertical swipes stay the page's
// scroll). Resolving an item (its full view) takes it out; the next card comes forward.
// Pulse, below, is what the assistant noticed, in the glow home's suggestion rows on a card;
// a row hands itself to the assistant. The assistant's own work is its status line above
// the orb (GlowDock), not part of the page.
export function AttentionSection({ queue, onSuggestion }: { queue: AttentionQueue; onSuggestion: (text: string, prompt: string) => void }) {
  // Every card opens a sheet of choices (the question card); loaded now, it is in the sheet's first frame,
  // so the sheet opens at its final height instead of growing when the code arrives (2026-10-26, direct feedback).
  useEffect(() => {
    preloadApprovalCard().catch((error: unknown) => console.error('Preloading the question card failed.', error));
  }, []);
  return (
    <section className={styles.root} aria-label="Attention">
      {/* Each block is a step of the home's recede into the assistant (data-recede-step,
          AgentHomePage.module.css), counted from the bottom up. */}
      {queue.caughtUp !== 'gone' && <AttentionBlock queue={queue} />}
      <div className={styles.pulse}>
        <div data-recede-step="1"><SuggestionList items={PULSE_ITEMS} onSuggestion={onSuggestion} /></div>
      </div>
    </section>
  );
}

// The transient part (2026-10-23, direct feedback): while items wait, a carousel (its "Needs you" title and Pulse's were
// removed 2026-10-30, direct feedback); once
// the last is resolved, "You're caught up" takes exactly its place — laid over an invisible
// copy of the title and a card, so nothing below moves — then sinks away, and the block closes
// so Pulse rises into its place.
function AttentionBlock({ queue }: { queue: AttentionQueue }) {
  const count = queue.items.length;
  const isCaughtUp = queue.caughtUp === 'showing' || queue.caughtUp === 'leaving';
  const onTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (queue.caughtUp === 'leaving' && event.target === event.currentTarget) queue.finishCaughtUp();
  };
  return (
    <div className={styles.block} data-closing={queue.caughtUp === 'leaving' ? '' : undefined} onTransitionEnd={onTransitionEnd}>
      <div className={styles.blockInner}>
        <div className={styles.queue} data-hidden={isCaughtUp ? '' : undefined} aria-hidden={isCaughtUp}>
          <div data-recede-step="3">{count === 0 ? <div className={styles.cardSpace} />
            : <PromoCarousel aria-label="Items needing attention" variant="edge">
              {queue.items.map((item, index) => <AttentionCard key={item.id} item={item} position={index + 1} count={count}
                isProcessing={queue.processing.includes(item.id)} onOpen={queue.open} />)}
            </PromoCarousel>}</div>
        </div>
        {isCaughtUp && <div className={styles.caughtUp} data-recede-step="3"><CaughtUpCard isLeaving={queue.caughtUp === 'leaving'} /></div>}
      </div>
    </div>
  );
}
