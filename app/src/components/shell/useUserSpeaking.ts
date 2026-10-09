import { useEffect, useState } from 'react';

// How long the "user is speaking" signal holds after the last transcript
// update — speech recognition reports words, not audio level, so silence is
// inferred from the interim transcript going quiet.
const USER_SPEAKING_HOLD_MS = 700;

// True while the user is audibly talking in voice mode (2026-10-06): drives
// the bottom voice wash. Derived from the live interim transcript rather than
// a second microphone stream, so no extra permission prompt.
export function useUserSpeaking(isListening: boolean, text: string) {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    if (!isListening || !text) {
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    const timer = setTimeout(() => setSpeaking(false), USER_SPEAKING_HOLD_MS);
    return () => clearTimeout(timer);
  }, [isListening, text]);
  return speaking;
}
