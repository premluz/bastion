import { useEffect, useRef } from 'react';
import { Text } from '@astryxdesign/core/Text';
import { StreamedText, streamDurationMs } from '../trail/StreamedText';

// LabelReveal floors a run at this long (its own constant); onComplete follows the run, as it followed the last word.
const MIN_RUN_MS = 300;

// The buy flow's replies, on the same feathered stream as every other agent reply (2026-10-28, direct request; it was
// Astryx's word streamer). The flow advances when the text has finished arriving.
export function StreamingReply({ text, onComplete }: { text: string; onComplete: () => void }) {
  const latest = useRef(onComplete);
  latest.current = onComplete;
  useEffect(() => {
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => latest.current(), reduced ? 0 : Math.max(streamDurationMs(text), MIN_RUN_MS));
    return () => window.clearTimeout(timer);
  }, [text]);
  return <Text aria-label={text}><StreamedText text={text} /></Text>;
}
