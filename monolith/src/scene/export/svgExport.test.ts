import { Color, Mesh, PerspectiveCamera, Scene, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { PALETTE } from '../../brand/palette';
import { buildMonolith } from '../../monolith/geometry/buildMonolith';
import { pieceGeometry } from '../../monolith/geometry/toBufferGeometry';
import { createCeramicMaterial, createCeramicUniforms } from '../../monolith/material/opticalCeramic';
import { VARIANTS } from '../../monolith/variants';
import { monolithSvg } from './svgExport';

describe.each(VARIANTS.map((v) => [v.name, v] as const))('%s SVG export', (_name, variant) => {
  it('draws the visible faces and the lit slots as clean vector polygons', () => {
    const scene = new Scene();
    for (const piece of buildMonolith(variant, { cutWidth: 0.034, bevel: 0.008 }).pieces) {
      const uniforms = createCeramicUniforms(piece.openings);
      scene.add(new Mesh(pieceGeometry(piece), [createCeramicMaterial('skin', uniforms), createCeramicMaterial('wall', uniforms)]));
    }
    const camera = new PerspectiveCamera(22, 1440 / 900, 0.1, 100);
    camera.position.set(7.4, 6.1, 7.4);
    camera.lookAt(0, -0.32, 0);
    camera.updateMatrixWorld();

    const svg = monolithSvg(scene, camera, 1440, 900, { base: PALETTE.graphite, signal: PALETTE.signal, light: new Vector3(-3, 7, 4).normalize() });
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="')).toBe(true);
    expect(svg).not.toContain('NaN');
    expect((svg.match(/<polygon /g) ?? []).length).toBeGreaterThan(6);
    expect(svg).toContain(`fill="${new Color(PALETTE.signal).getStyle()}"`);
  });
});
