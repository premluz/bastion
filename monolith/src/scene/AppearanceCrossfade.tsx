import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Appearance } from '../settings';

/** After the composer (priority 1) has drawn the frame, so the snapshot is exactly the old look. */
const AFTER_COMPOSER = 2;

interface AppearanceCrossfadeProps {
  /** What the host asked for. */
  readonly requested: Appearance;
  /** What is on screen. */
  readonly displayed: Appearance;
  /** A crossfade is still running; a new change waits for it, so fades never stack. */
  readonly fading: boolean;
  /** The old frame, and the appearance to commit in the same step, so the new look never shows uncovered. */
  readonly onSnapshot: (bitmap: ImageBitmap, next: Appearance) => void;
  /** The frame could not be captured; commit the change without a fade. */
  readonly onFailure: (next: Appearance, cause: unknown) => void;
}

/** Captures the current frame the moment the appearance changes, so the old look can fade out over the new. */
export function AppearanceCrossfade({ requested, displayed, fading, onSnapshot, onFailure }: AppearanceCrossfadeProps) {
  const capturing = useRef(false);
  useFrame(({ gl }) => {
    if (requested === displayed || fading || capturing.current) return;
    capturing.current = true;
    const next = requested;
    createImageBitmap(gl.domElement).then(
      (bitmap) => {
        capturing.current = false;
        onSnapshot(bitmap, next);
      },
      (cause: unknown) => {
        capturing.current = false;
        onFailure(next, cause);
      },
    );
  }, AFTER_COMPOSER);
  return null;
}
