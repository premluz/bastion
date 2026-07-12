import { Text } from '@astryxdesign/core/Text';
import type { TextBlockProps } from '../../contracts/props/text-block';

// Voice face (Phase 8E, three-voice ruling): text-block carries the
// agent's interpretive prose — findings, never numerals, never labels —
// so it renders in --face-voice, not the UI face everything else uses.
export function TextBlock({ text }: TextBlockProps) {
  const paragraphs = text.split('\n\n');
  return (
    <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
      {paragraphs.map((paragraph) => (
        <Text key={paragraph} type="body" as="p" display="block" style={{ fontFamily: 'var(--face-voice)' }}>
          {paragraph}
        </Text>
      ))}
    </div>
  );
}
