import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { PALETTE } from '../../brand/palette';
import { useExport } from '../../state/exportStore';
import { downloadDataUrl, downloadText, exportName } from './download';
import { monolithSvg } from './svgExport';

/** Matches the key light in StudioLighting, so the vector shading agrees with the render. */
const KEY_LIGHT = new Vector3(-3, 7, 4).normalize();
/** After the composer (priority 1) has drawn the frame, so the PNG is exactly what is on screen. */
const AFTER_COMPOSER = 2;

interface ExporterProps {
  /** Ceramic body colour for the vector export. */
  readonly base: string;
  /** Words for the file name, e.g. page, variant, appearance. */
  readonly nameParts: readonly string[];
}

export function Exporter({ base, nameParts }: ExporterProps) {
  useFrame(({ gl, scene, camera, size }) => {
    const kind = useExport.getState().take();
    if (kind === 'png') {
      downloadDataUrl(gl.domElement.toDataURL('image/png'), exportName(nameParts, 'png'));
    } else if (kind === 'svg') {
      const svg = monolithSvg(scene, camera, size.width, size.height, { base, signal: PALETTE.signal, light: KEY_LIGHT });
      downloadText(svg, exportName(nameParts, 'svg'), 'image/svg+xml');
    }
  }, AFTER_COMPOSER);
  return null;
}
