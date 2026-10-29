import { useEffect, useRef } from 'react';
import { shapeValue, shapeVoice, SILENT_VOICE, type VoiceLevels } from '../../engine/voiceLevels';

/** A long frame (a backgrounded tab, a stall) must not make the shaping jump. */
const MAX_FRAME_S = 0.1;

// A voice made up: phrases of speech with gaps between them, the bands moving differently. For Storybook, where
// there is no microphone to speak into.
export function useSimulatedVoice(isActive: boolean, onFrame: (levels: VoiceLevels) => void) {
  const latest = useRef(onFrame);
  latest.current = onFrame;
  useEffect(() => {
    if (!isActive) return;
    let frame = 0;
    let shaped = SILENT_VOICE;
    let previous = performance.now();
    const tick = (now: number) => {
      const seconds = now / 1000;
      const phrase = Math.max(0, Math.sin(seconds * 1.1)) ** 0.6;
      const syllables = 0.45 + 0.55 * Math.abs(Math.sin(seconds * 7.3));
      const level = 0.28 * phrase * syllables;
      shaped = shapeVoice(shaped, {
        level,
        low: 0.6 * phrase * (0.6 + 0.4 * Math.sin(seconds * 3.1)),
        mid: 0.5 * phrase * (0.5 + 0.5 * Math.sin(seconds * 5.3 + 1)),
        high: 0.35 * phrase * (0.5 + 0.5 * Math.sin(seconds * 8.9 + 2)),
      }, Math.min(MAX_FRAME_S, (now - previous) / 1000));
      previous = now;
      latest.current(shaped);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      latest.current(SILENT_VOICE);
    };
  }, [isActive]);
}

/** How loud a voice we are told is speaking, when it cannot be measured (the microphone is unavailable). */
const SPEAKING_LEVEL = 0.6;

// The fallback: only that the user is speaking is known (from the transcript), not how loudly, so the glow holds
// a steady, middling level while they do and settles when they stop.
export function useSpeakingVoice(isActive: boolean, isSpeaking: boolean, onFrame: (levels: VoiceLevels) => void) {
  const latest = useRef(onFrame);
  latest.current = onFrame;
  const speaking = useRef(isSpeaking);
  speaking.current = isSpeaking;
  useEffect(() => {
    if (!isActive) return;
    let frame = 0;
    let level = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      level = shapeValue(level, speaking.current ? SPEAKING_LEVEL : 0, Math.min(MAX_FRAME_S, (now - previous) / 1000));
      previous = now;
      latest.current({ level, low: level, mid: level * 0.8, high: level * 0.6 });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      latest.current(SILENT_VOICE);
    };
  }, [isActive]);
}
