export interface RecognitionSegment { transcript: string; isFinal: boolean }

// Loose comparison key: hypotheses of the same utterance differ in
// punctuation and symbols ("$50" vs "%50" vs "50"), never in the words.
const key = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

// Builds the live transcript from a SpeechRecognition result list.
//
// Desktop Chrome returns finalized segments followed by at most one interim
// one, so joining them is right. Android Chrome (continuous + interimResults)
// instead delivers each partial hypothesis as its OWN entry — "send",
// "send $50%", "send %50", "send %50 to"… — so joining them repeats the whole
// utterance (2026-10-09, reported on device). Therefore:
//   - of the non-final entries only the latest counts, it supersedes the rest;
//   - a segment that restates the one before it (same words, extended) replaces
//     it instead of being appended.
export function assembleTranscript(segments: readonly RecognitionSegment[]): string {
  const parts: string[] = [];
  const lastIndex = segments.length - 1;
  segments.forEach((segment, index) => {
    const text = segment.transcript.trim();
    if (!text) return;
    if (!segment.isFinal && index !== lastIndex) return;
    const previous = parts[parts.length - 1];
    if (previous !== undefined && key(text).startsWith(key(previous))) parts[parts.length - 1] = text;
    else parts.push(text);
  });
  return parts.join(' ');
}
