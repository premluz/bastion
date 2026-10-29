import { useFrame } from '@react-three/fiber';
import { Bloom } from '@react-three/postprocessing';
import type { BloomEffect } from 'postprocessing';
import { useRef } from 'react';
import { damp } from '../monolith/intelligence/damp';

interface BloomValues {
  readonly threshold: number;
  readonly smoothing: number;
  readonly intensity: number;
  readonly radius: number;
  readonly mipmapBlur?: boolean;
}

/** Calm: ~95% of the way in 0.75 s. */
const EASE_RATE = 4;

/**
 * Bloom whose settings change live and ease toward new targets. The wrapper rebuilds the effect when
 * its constructor options change, and the composer keeps the original instance — so options are set
 * once and the live values are written straight onto the running effect instead.
 */
export function OuterGlowBloom(values: BloomValues) {
  const effect = useRef<BloomEffect>(null);
  const target = useRef(values);
  target.current = values;
  const shown = useRef<BloomValues | null>(null);

  useFrame((_, delta) => {
    const bloom = effect.current;
    if (bloom === null) return;
    const to = target.current;
    const from = shown.current ?? to;
    const next: BloomValues = {
      threshold: damp(from.threshold, to.threshold, EASE_RATE, delta),
      smoothing: damp(from.smoothing, to.smoothing, EASE_RATE, delta),
      intensity: damp(from.intensity, to.intensity, EASE_RATE, delta),
      radius: damp(from.radius, to.radius, EASE_RATE, delta),
    };
    shown.current = next;
    bloom.intensity = next.intensity;
    bloom.luminanceMaterial.threshold = next.threshold;
    bloom.luminanceMaterial.smoothing = next.smoothing;
    bloom.mipmapBlurPass.radius = next.radius;
  });

  return <Bloom ref={effect} mipmapBlur={values.mipmapBlur ?? true} />;
}
