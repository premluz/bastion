import { useEffect } from 'react';
import { Text } from '@astryxdesign/core/Text';
import { useStreamingText } from '@astryxdesign/core/hooks';

export function StreamingReply({ text, onComplete }: { text: string; onComplete: () => void }) {
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const displayed = useStreamingText(text, !reduced);
  useEffect(() => { if (displayed === text) onComplete(); }, [displayed, text, onComplete]);
  return <Text aria-label={text}>{displayed}</Text>;
}
