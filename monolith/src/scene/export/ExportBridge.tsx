import { useFrame } from '@react-three/fiber';
import type { MutableRefObject } from 'react';
import { Vector3 } from 'three';
import { PALETTE } from '../../brand/palette';
import { monolithSvg } from './svgExport';

export interface ExportRequest {
  readonly kind: 'png' | 'svg';
  readonly resolve: (value: string) => void;
  readonly reject: (error: Error) => void;
}

/** Matches the key light in StudioLighting, so the vector shading agrees with the render. */
const KEY_LIGHT = new Vector3(-3, 7, 4).normalize();
/** After the composer (priority 1) has drawn the frame, so the PNG is exactly what is on screen. */
const AFTER_COMPOSER = 2;

interface ExportBridgeProps {
  readonly queue: MutableRefObject<ExportRequest[]>;
  /** Ceramic body colour for the vector export. */
  readonly base: string;
}

/** Serves export requests from the render loop, where the frame is guaranteed to be complete. */
export function ExportBridge({ queue, base }: ExportBridgeProps) {
  useFrame(({ gl, scene, camera, size }) => {
    for (let request = queue.current.shift(); request !== undefined; request = queue.current.shift()) {
      try {
        request.resolve(
          request.kind === 'png'
            ? gl.domElement.toDataURL('image/png')
            : monolithSvg(scene, camera, size.width, size.height, { base, signal: PALETTE.signal, light: KEY_LIGHT }),
        );
      } catch (cause: unknown) {
        request.reject(cause instanceof Error ? cause : new Error(`Export failed: ${String(cause)}`));
      }
    }
  }, AFTER_COMPOSER);
  return null;
}
