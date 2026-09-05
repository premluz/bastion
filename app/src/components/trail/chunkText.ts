// Splits a string into single-word chunks for the chunked text-reveal
// effect (TextChunkReveal.tsx) — 2026-08-23 follow-up, direct feedback:
// "instead multiple letters it always prints 1 word... always 1 and
// faster" — reverses the prior randomly-sized (1-3 word) chunking in
// favor of a strict word-for-word reveal. No seeding/randomness needed
// anymore: splitting on whitespace boundaries is fully deterministic on
// its own.
export function chunkText(text: string): string[] {
  const words = text.split(/(\s+)/).filter((part) => part.length > 0);
  const chunks: string[] = [];
  let index = 0;

  while (index < words.length) {
    // Each "word" slot in `words` alternates token/whitespace (split's
    // own capturing-group behavior) — pull whole word+trailing-space
    // pairs so a chunk boundary never splits a word from the space that
    // follows it.
    chunks.push(words.slice(index, index + 2).join(''));
    index += 2;
  }

  return chunks;
}
