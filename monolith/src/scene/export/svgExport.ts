import { Color, Matrix3, Mesh, Vector3, type BufferAttribute, type Camera, type Object3D } from 'three';
import { ceramicSource } from '../../monolith/material/opticalCeramic';

export interface SvgStyle {
  /** Body colour of the ceramic. */
  readonly base: string;
  /** Slot-wall colour — the inner light. */
  readonly signal: string;
  /** Direction toward the key light, world space. */
  readonly light: Vector3;
}

interface Face2D {
  readonly points: readonly [number, number][];
  readonly depth: number;
  readonly fill: string;
}

const SKIN_GROUP = 0;
const MARGIN = 0.04;
/** A hairline of the fill colour hides anti-aliasing seams between neighbouring faces. */
const SEAM_STROKE = 0.6;

function shade(base: Color, normal: Vector3, light: Vector3): string {
  const lambert = Math.max(0, normal.dot(light));
  return base.clone().multiplyScalar(0.42 + 0.7 * lambert).getStyle();
}

/** Rebuilds the convex polygons the geometry builder fanned into triangles (same first vertex and normal). */
function polygons(position: BufferAttribute, normal: BufferAttribute, start: number, count: number) {
  const out: { indices: number[]; normal: Vector3 }[] = [];
  const first = new Vector3();
  const lastFirst = new Vector3();
  for (let v = start; v < start + count; v += 3) {
    first.fromBufferAttribute(position, v);
    const n = new Vector3().fromBufferAttribute(normal, v);
    const current = out[out.length - 1];
    if (current !== undefined && first.equals(lastFirst) && current.normal.equals(n)) {
      current.indices.push(v + 2);
    } else {
      out.push({ indices: [v, v + 1, v + 2], normal: n });
    }
    lastFirst.copy(first);
  }
  return out;
}

function facesOf(mesh: Mesh, camera: Camera, width: number, height: number, style: SvgStyle): Face2D[] {
  const position = mesh.geometry.getAttribute('position');
  const normal = mesh.geometry.getAttribute('normal');
  if (!('isBufferAttribute' in position) || !('isBufferAttribute' in normal)) return [];
  const normalMatrix = new Matrix3().getNormalMatrix(mesh.matrixWorld);
  const base = new Color(style.base);
  const faces: Face2D[] = [];
  for (const group of mesh.geometry.groups) {
    const skin = group.materialIndex === SKIN_GROUP;
    for (const poly of polygons(position, normal, group.start, group.count)) {
      const worldNormal = poly.normal.clone().applyMatrix3(normalMatrix).normalize();
      const world = poly.indices.map((i) => new Vector3().fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld));
      const anchor = world[0];
      if (anchor === undefined) continue;
      const toCamera = new Vector3().setFromMatrixPosition(camera.matrixWorld).sub(anchor);
      if (worldNormal.dot(toCamera) <= 0) continue;
      const depth = world.reduce((sum, p) => sum + p.distanceTo(new Vector3().setFromMatrixPosition(camera.matrixWorld)), 0) / world.length;
      const points = world.map((p): [number, number] => {
        const ndc = p.clone().project(camera);
        return [((ndc.x + 1) / 2) * width, ((1 - ndc.y) / 2) * height];
      });
      faces.push({ points, depth, fill: skin ? shade(base, worldNormal, style.light) : new Color(style.signal).getStyle() });
    }
  }
  return faces;
}

/**
 * A vector drawing of the monolith exactly as posed and framed: visible faces flat-shaded by the key
 * light, slot walls in the signal colour, painted far to near, on a transparent background.
 */
export function monolithSvg(scene: Object3D, camera: Camera, width: number, height: number, style: SvgStyle): string {
  scene.updateMatrixWorld();
  const eye = new Vector3().setFromMatrixPosition(camera.matrixWorld);
  const pieces: { depth: number; faces: Face2D[] }[] = [];
  scene.traverseVisible((object) => {
    if (!(object instanceof Mesh) || !Array.isArray(object.material)) return;
    const first = object.material[0];
    if (first === undefined || ceramicSource(first) === undefined) return;
    object.geometry.computeBoundingSphere();
    const centre = object.geometry.boundingSphere?.center.clone().applyMatrix4(object.matrixWorld) ?? new Vector3();
    const faces = facesOf(object, camera, width, height, style).sort((a, b) => b.depth - a.depth);
    pieces.push({ depth: centre.distanceTo(eye), faces });
  });
  // Painter's order per piece: pieces never interpenetrate, so whole pieces sort far to near; faces
  // sort within each piece. Sorting single faces globally lets a large slot wall paint over nearer faces.
  const faces = pieces.sort((a, b) => b.depth - a.depth).flatMap((piece) => piece.faces);
  if (faces.length === 0) throw new Error('SVG export: no monolith faces are visible in the scene');

  const xs = faces.flatMap((f) => f.points.map((p) => p[0]));
  const ys = faces.flatMap((f) => f.points.map((p) => p[1]));
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const pad = Math.max(maxX - minX, maxY - minY) * MARGIN;
  const box = [minX - pad, minY - pad, maxX - minX + 2 * pad, maxY - minY + 2 * pad].map((v) => v.toFixed(2));

  const paths = faces.map((f) => {
    const pts = f.points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    return `  <polygon points="${pts}" fill="${f.fill}" stroke="${f.fill}" stroke-width="${SEAM_STROKE}" stroke-linejoin="round"/>`;
  });
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(' ')}" width="${box[2]}" height="${box[3]}">`,
    ...paths,
    '</svg>',
    '',
  ].join('\n');
}
