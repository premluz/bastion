import { useEffect, useRef } from 'react';
import type { ShellPreviewMode } from './useMobileFrame';

type Sound = 'tap' | 'listening-start' | 'listening-end';
type Tone = { from: number; to: number; delay: number; duration: number; level: number; wave: OscillatorType };

const tones: Record<Sound, readonly Tone[]> = {
  tap: [
    { from: 920, to: 710, delay: 0, duration: 0.055, level: 0.025, wave: 'sine' },
    { from: 460, to: 390, delay: 0.008, duration: 0.075, level: 0.012, wave: 'triangle' },
  ],
  'listening-start': [
    { from: 520, to: 610, delay: 0, duration: 0.15, level: 0.023, wave: 'sine' },
    { from: 780, to: 915, delay: 0.038, duration: 0.17, level: 0.016, wave: 'sine' },
  ],
  'listening-end': [
    { from: 610, to: 510, delay: 0, duration: 0.13, level: 0.019, wave: 'sine' },
    { from: 915, to: 765, delay: 0.022, duration: 0.14, level: 0.012, wave: 'sine' },
  ],
};

let context: AudioContext | null = null;

function playTone(audio: AudioContext, tone: Tone) {
  const start = audio.currentTime + tone.delay;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = tone.wave;
  oscillator.frequency.setValueAtTime(tone.from, start);
  oscillator.frequency.exponentialRampToValueAtTime(tone.to, start + tone.duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(tone.level, start + Math.min(tone.duration / 5, 0.018));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + tone.duration);
}

function playSound(sound: Sound) {
  if (!window.AudioContext) {
    console.error('Assistant interface sounds require Web Audio support.');
    return;
  }
  context ??= new window.AudioContext();
  if (context.state === 'suspended') void context.resume().catch((cause: unknown) => {
    console.error(`Could not play assistant ${sound} sound`, cause);
  });
  for (const tone of tones[sound]) playTone(context, tone);
}

export function useAssistantSounds(mode: ShellPreviewMode, isListening: boolean, isSuspended: boolean) {
  const wasListening = useRef(false);

  useEffect(() => {
    if (mode !== 'conversation') { wasListening.current = false; return; }
    if (isListening && !wasListening.current) playSound('listening-start');
    if (!isListening && wasListening.current && !isSuspended) playSound('listening-end');
    wasListening.current = isListening;
  }, [mode, isListening, isSuspended]);

  useEffect(() => {
    if (mode === 'idle') return;
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest('button, label, [role="radio"]');
      if (!control || control.matches(':disabled, [aria-disabled="true"]')) return;
      if (!control.closest('[aria-label="Assistant composer"], [aria-label="Assistant conversation"]')) return;
      playSound('tap');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [mode]);
}
