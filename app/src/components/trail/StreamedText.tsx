import { createContext, useContext, useEffect } from 'react';
import { config } from '../../config';
import { LabelReveal } from './LabelReveal';

// Streamed replies that have finished, by turn and text. A reply is drawn again whenever its surface remounts (chat ⇄
// voice, the composer closing and reopening), and must not stream its whole history out again each time: once it has
// landed it is plain text. Two surfaces showing a reply at once both stream it (neither has landed yet).
const landed = new Set<string>();

/** How long a reply of this text takes to stream: its length at the configured pace, capped. */
export const streamDurationMs = (text: string) => Math.min(config.streaming.maxMs, text.length * config.streaming.msPerChar);

/** The conversation turn whose replies these are: the same words in a later turn are a new reply and stream again. */
export const StreamScope = createContext('');

// An assistant reply, streamed in (2026-10-28, direct request): the same feathered, even-paced stream as the trail's
// step labels (LabelReveal, from Merlin), paced by the reply's own length. Still one text node when done.
export function StreamedText({ text }: { text: string }) {
  const key = `${useContext(StreamScope)}|${text}`;
  const durationMs = streamDurationMs(text);
  const isLanded = landed.has(key);
  useEffect(() => {
    if (isLanded) return;
    // LabelReveal floors a run at 300 ms (its own constant); the reply lands once its run has finished.
    const timer = window.setTimeout(() => landed.add(key), Math.max(durationMs, 300));
    return () => window.clearTimeout(timer);
  }, [isLanded, key, durationMs]);
  return isLanded ? <>{text}</> : <LabelReveal text={text} durationMs={durationMs} />;
}
