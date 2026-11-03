import { useMemo, useRef, useState } from 'react';
import { prefersReducedMotion } from './LabelReveal';
import { rollAnimationCount, rollSlots, type RollSlot } from './rollingSlots';
import styles from './RollingText.module.css';

// The stagger is set by slot, in the stylesheet; slots past this one share its delay.
const LAST_ORDER = 8;

function Slot({ slot }: { slot: RollSlot }) {
  const order = Math.min(slot.order, LAST_ORDER);
  if (slot.kind === 'enter') return <span className={styles.enter} data-order={order}>{slot.char}</span>;
  if (slot.kind === 'leave') return <span className={styles.leave} data-order={order} aria-hidden="true">{slot.from}</span>;
  return <span className={styles.roll} data-order={order}>
    <span className={styles.next}>{slot.char}</span>
    <span className={styles.prev} aria-hidden="true">{slot.from}</span>
  </span>;
}

interface Shown { text: string; from: string | null; change: number }

// Text that changes rolls instead of jumping (2026-10-31, direct feedback, from the Stageshow skill's motion rules: every
// change moves, and only what changed). Paired from the right, as figures are: the last digit moves first, unchanged digits
// stay still, characters only in one of the two texts open or close their own room. Per-character spans exist only while
// a change is moving; once its animations end it is one plain text node again (LabelReveal's standing order, 2026-09-06).
// The first render, and every change under reduced motion, is plain text.
export function RollingText({ text }: { text: string }) {
  const [shown, setShown] = useState<Shown>({ text, from: null, change: 0 });
  const ended = useRef({ change: -1, count: 0 });
  if (shown.text !== text) setShown({ text, from: prefersReducedMotion() ? null : shown.text, change: shown.change + 1 });
  const slots = useMemo(() => (shown.from === null ? [] : rollSlots(shown.from, shown.text)), [shown]);
  if (shown.from === null) return text;
  const total = rollAnimationCount(slots);
  const settle = () => {
    if (ended.current.change !== shown.change) ended.current = { change: shown.change, count: 0 };
    ended.current.count += 1;
    if (ended.current.count >= total) setShown((current) => (current.change === shown.change ? { ...current, from: null } : current));
  };
  return <span className={styles.root} onAnimationEnd={settle}>
    {slots.map((slot, index) => (slot.kind === 'still' ? slot.char : <Slot key={`${shown.change}-${index}`} slot={slot} />))}
  </span>;
}
