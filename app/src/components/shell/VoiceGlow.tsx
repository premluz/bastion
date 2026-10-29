import { useCallback, useRef } from 'react';
import type { VoiceLevels } from '../../engine/voiceLevels';
import { useMicLevels } from './useMicLevels';
import { useSimulatedVoice, useSpeakingVoice } from './useSyntheticVoice';
import styles from './VoiceGlow.module.css';

export interface VoiceGlowProps {
  /** The microphone is open and the user can be heard: the glow shows and follows the voice. */
  isActive: boolean;
  /** Known only from the transcript (not how loud): stands in for the level when the microphone cannot be read. */
  isSpeaking?: boolean;
  /** A made-up voice instead of the microphone (Storybook). */
  simulate?: boolean;
}

const LOBES = 5;

// The voice glow (2026-10-28, direct request: rebuilt from the voice-glow package's design for voice mode): a centred,
// colourful beam along the bottom edge that rises and blooms with the voice. Five lobes of light — the middle one
// follows the lows, its neighbours the mids, the outer pair the highs, so a voice ripples outward rather than one blob
// pumping — over a thin lit edge, in the brand accent and the prismatic blue, violet and pink. Reads the real
// microphone; the values go straight to the element as custom properties (no re-render per frame).
export function VoiceGlow({ isActive, isSpeaking = false, simulate = false }: VoiceGlowProps) {
  const host = useRef<HTMLDivElement>(null);
  const apply = useCallback((levels: VoiceLevels) => {
    const element = host.current;
    if (!element) return;
    element.style.setProperty('--voice-level', levels.level.toFixed(3));
    element.style.setProperty('--voice-low', levels.low.toFixed(3));
    element.style.setProperty('--voice-mid', levels.mid.toFixed(3));
    element.style.setProperty('--voice-high', levels.high.toFixed(3));
  }, []);
  const mic = useMicLevels(isActive && !simulate, apply);
  const micFailed = mic === 'denied' || mic === 'unsupported' || mic === 'error';
  useSimulatedVoice(isActive && simulate, apply);
  useSpeakingVoice(isActive && !simulate && micFailed, isSpeaking, apply);
  return (
    <div ref={host} className={styles.root} data-active={isActive ? '' : undefined} data-source={simulate ? 'simulated' : micFailed ? 'transcript' : 'microphone'} aria-hidden="true">
      <div className={styles.lobes}>
        {Array.from({ length: LOBES }, (_, lobe) => <span key={lobe} className={styles.lobe} />)}
      </div>
      <span className={styles.edge} />
    </div>
  );
}
