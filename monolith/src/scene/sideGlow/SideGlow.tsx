import { useFrame, useThree } from '@react-three/fiber';
import { GaussianBlurPass } from 'postprocessing';
import { useEffect, useMemo } from 'react';
import { Color, HalfFloatType, Mesh, WebGLRenderTarget, type Material, type Object3D } from 'three';
import { glowMaterials } from '../../monolith/material/glowMaterials';
import { SideGlowEffect } from './SideGlowEffect';

/** The glow pass runs at a fraction of the drawing buffer: it is blurred wide anyway. */
const RESOLUTION = 0.125;
/**
 * A true separable Gaussian: one smooth, round falloff. (Kawase left a diamond; mip blur stacked
 * per-level copies of the outline into visible layers.)
 */
const BLUR_KERNEL = 63;
const BLUR_ITERATIONS = 2;
const BLACK = new Color(0, 0, 0);
const savedClear = new Color();

interface Swap {
  readonly mesh: Mesh;
  readonly material: Material | Material[];
}

/**
 * Light the monolith throws sideways: every face's emission — including the faces turned away from
 * the camera — is drawn without depth into a small buffer, blurred wide and added around the outline.
 * Must sit inside the EffectComposer; it renders before the composer (frame priority 0 < 1).
 */
export function SideGlow({ strength }: { readonly strength: number }) {
  const { gl, scene, camera, size, viewport } = useThree();
  const effect = useMemo(() => new SideGlowEffect(), []);
  const raw = useMemo(() => new WebGLRenderTarget(1, 1, { type: HalfFloatType }), []);
  const blurred = useMemo(() => new WebGLRenderTarget(1, 1, { type: HalfFloatType }), []);
  const blur = useMemo(
    () => new GaussianBlurPass({ kernelSize: BLUR_KERNEL, iterations: BLUR_ITERATIONS, resolutionScale: 1 }),
    [],
  );

  useEffect(() => {
    const width = Math.max(1, Math.round(size.width * viewport.dpr * RESOLUTION));
    const height = Math.max(1, Math.round(size.height * viewport.dpr * RESOLUTION));
    raw.setSize(width, height);
    blurred.setSize(width, height);
    blur.setSize(width, height);
  }, [size, viewport.dpr, raw, blurred, blur]);

  useEffect(
    () => () => {
      raw.dispose();
      blurred.dispose();
      blur.dispose();
      effect.dispose();
    },
    [raw, blurred, blur, effect],
  );

  useFrame(() => {
    effect.strength = strength;
    if (strength <= 0) return;
    const swaps: Swap[] = [];
    const hidden: Object3D[] = [];
    scene.traverse((object) => {
      if (!(object instanceof Mesh) || !object.visible) return;
      const glow = glowMaterials(object.material);
      if (glow === null) {
        hidden.push(object);
        object.visible = false;
        return;
      }
      swaps.push({ mesh: object, material: object.material });
      object.material = glow;
    });
    const background = scene.background;
    const clearColor = gl.getClearColor(savedClear);
    const clearAlpha = gl.getClearAlpha();
    scene.background = null;
    gl.setClearColor(BLACK, 0);
    gl.setRenderTarget(raw);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(clearColor, clearAlpha);
    scene.background = background;
    for (const swap of swaps) swap.mesh.material = swap.material;
    for (const object of hidden) object.visible = true;
    blur.render(gl, raw, blurred);
    effect.glowMap = blurred.texture;
  });

  return <primitive object={effect} dispose={null} />;
}
