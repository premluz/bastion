// What the voice glow reads from a microphone (2026-10-28, direct request: rebuilt from the voice-glow package's design —
// one analyser, an overall level plus low / mid / high band energy, shaped by gain, a noise gate and attack / release).
// Pure maths: the hook that owns the microphone is components/shell/useMicLevels.ts.
export interface VoiceLevels { level: number; low: number; mid: number; high: number }

export const SILENT_VOICE: VoiceLevels = { level: 0, low: 0, mid: 0, high: 0 };

export const VOICE_RESPONSE = {
  /** Input gain: raise for quiet sources. */
  sensitivity: 3,
  /** Noise gate: a raw level below this is silence. */
  threshold: 0.03,
  /** Seconds to rise to a louder level, and to settle to a quieter one. */
  attackS: 0.08,
  releaseS: 0.45,
} as const;

/** The three bands, as the edges of the spectrum in Hz: the low lobe follows the lows, its neighbours the mids, the outer pair the highs. */
export const VOICE_BANDS = { lowTo: 700, midTo: 3000, highTo: 7500 } as const;

/** Root-mean-square of time-domain bytes (128 is silence), 0 to 1. */
export function rmsOfBytes(samples: ArrayLike<number>): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const centred = ((samples[index] ?? 128) - 128) / 128;
    sum += centred * centred;
  }
  return Math.sqrt(sum / samples.length);
}

/** Mean energy (0 to 1) of the spectrum bytes between two frequencies; `binHz` is the width of one bin. */
function bandMean(spectrum: ArrayLike<number>, binHz: number, fromHz: number, toHz: number): number {
  const from = Math.max(0, Math.floor(fromHz / binHz));
  const to = Math.min(spectrum.length, Math.max(from + 1, Math.ceil(toHz / binHz)));
  let sum = 0;
  for (let bin = from; bin < to; bin += 1) sum += (spectrum[bin] ?? 0) / 255;
  return sum / (to - from);
}

export function bandsOfSpectrum(spectrum: ArrayLike<number>, binHz: number): Pick<VoiceLevels, 'low' | 'mid' | 'high'> {
  return {
    low: bandMean(spectrum, binHz, 0, VOICE_BANDS.lowTo),
    mid: bandMean(spectrum, binHz, VOICE_BANDS.lowTo, VOICE_BANDS.midTo),
    high: bandMean(spectrum, binHz, VOICE_BANDS.midTo, VOICE_BANDS.highTo),
  };
}

/** One value toward its target: gated, gained and softly saturated (never past 1), then eased fast up and slowly down. */
export function shapeValue(previous: number, raw: number, deltaS: number, response = VOICE_RESPONSE): number {
  const gated = raw < response.threshold ? 0 : raw;
  const target = 1 - Math.exp(-gated * response.sensitivity * 2);
  const seconds = target > previous ? response.attackS : response.releaseS;
  return previous + (target - previous) * (1 - Math.exp(-deltaS / seconds));
}

export function shapeVoice(previous: VoiceLevels, raw: VoiceLevels, deltaS: number): VoiceLevels {
  return {
    level: shapeValue(previous.level, raw.level, deltaS),
    low: shapeValue(previous.low, raw.low, deltaS),
    mid: shapeValue(previous.mid, raw.mid, deltaS),
    high: shapeValue(previous.high, raw.high, deltaS),
  };
}
