import { useEffect, useRef, useState } from 'react';
import { bandsOfSpectrum, rmsOfBytes, shapeVoice, SILENT_VOICE, type VoiceLevels } from '../../engine/voiceLevels';

export type MicState = 'idle' | 'requesting' | 'live' | 'denied' | 'unsupported' | 'error';

const FFT_SIZE = 256;
const SMOOTHING = 0.5;
/** A long frame (a backgrounded tab, a stall) must not make the shaping jump. */
const MAX_FRAME_S = 0.1;

// One AudioContext for the app; each listening session adds a source to it and takes it away again. Nothing is
// connected to the output: the audio is analysed, never played.
let sharedContext: AudioContext | null = null;
const audioContext = () => (sharedContext ??= new AudioContext());

// The microphone's level and low / mid / high energy, every animation frame, while `isActive` (2026-10-28, the voice
// glow). The raw dynamics matter here, so the browser's echo cancellation, noise suppression and gain control are
// asked to stand aside. `onFrame` is called outside React's render: the values go straight to the glow's element.
export function useMicLevels(isActive: boolean, onFrame: (levels: VoiceLevels) => void): MicState {
  const [state, setState] = useState<MicState>('idle');
  const latest = useRef(onFrame);
  latest.current = onFrame;

  useEffect(() => {
    if (!isActive) {
      setState('idle');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === 'undefined') {
      setState('unsupported');
      return;
    }
    let cancelled = false;
    let frame = 0;
    let release = () => {};
    setState('requesting');
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      .then(async (stream) => {
        const context = audioContext();
        if (context.state === 'suspended') await context.resume();
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const analyser = context.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = SMOOTHING;
        const source = context.createMediaStreamSource(stream);
        source.connect(analyser);
        release = () => {
          source.disconnect();
          stream.getTracks().forEach((track) => track.stop());
        };
        const time = new Uint8Array(analyser.fftSize);
        const spectrum = new Uint8Array(analyser.frequencyBinCount);
        const binHz = context.sampleRate / analyser.fftSize;
        let shaped = SILENT_VOICE;
        let previous = performance.now();
        const tick = (now: number) => {
          analyser.getByteTimeDomainData(time);
          analyser.getByteFrequencyData(spectrum);
          shaped = shapeVoice(shaped, { level: rmsOfBytes(time), ...bandsOfSpectrum(spectrum, binHz) }, Math.min(MAX_FRAME_S, (now - previous) / 1000));
          previous = now;
          latest.current(shaped);
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        setState('live');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        // Declining the microphone is a normal answer; anything else is worth saying.
        if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError' || error.name === 'NotFoundError')) {
          setState('denied');
          return;
        }
        console.error('The voice glow could not open the microphone.', error);
        setState('error');
      });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      release();
      latest.current(SILENT_VOICE);
    };
  }, [isActive]);

  return state;
}
