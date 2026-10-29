// What the assistant's narration is made of (moved out of useVoiceNarration.ts 2026-10-28 for the file budget).
// One line the assistant says: a recorded clip, or text for the browser's
// speech synthesis when no clip exists yet (2026-10-09, Prem: "browser TTS
// now"). Callbacks let a scenario react to its own narration.
export interface NarrationLine {
  key: string;
  clip?: string;
  text?: string;
  onPlaying?: (durationMs: number) => void;
  onEnd?: () => void;
  onFail?: () => void;
}
/** A line the thread wants said, keyed by the message it belongs to. */
export interface NarrationTarget { id: number; line: NarrationLine | null }
