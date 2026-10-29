import { Text } from '@astryxdesign/core/Text';
import type { TextBlockProps } from '../../contracts/props/text-block';
import { StreamedText } from '../trail/StreamedText';

// Voice face (Phase 8E, three-voice ruling): text-block carries the
// agent's interpretive prose — findings, never numerals, never labels —
// so it renders in --face-voice, not the UI face everything else uses. It streams in
// (2026-10-28, direct request): it is the agent's reply.
export function TextBlock({ text }: TextBlockProps) {
  const paragraphs = text.split('\n\n');
  return (
    <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
      {paragraphs.map((paragraph) => (
        <Text key={paragraph} type="body" as="p" display="block" style={{ fontFamily: 'var(--face-voice)' }}>
          <StreamedText text={paragraph} />
        </Text>
      ))}
    </div>
  );
}
