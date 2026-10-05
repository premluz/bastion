import { useEffect, useState, type RefObject } from 'react';
import { createLiquidOrbRenderer, type LiquidOrbRenderer } from './liquidOrbRenderer';

type LiquidOrbActivity = 'listening' | 'thinking';

export function useLiquidOrb(canvasRef: RefObject<HTMLCanvasElement | null>, activity: LiquidOrbActivity | null) {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activity) {
      setSupported(null);
      return;
    }

    let renderer: LiquidOrbRenderer | null;
    try {
      renderer = createLiquidOrbRenderer(canvas);
    } catch (error) {
      console.error('Liquid orb initialization failed.', error);
      setSupported(false);
      return;
    }
    if (!renderer) {
      setSupported(false);
      return;
    }

    setSupported(true);
    let animationFrame = 0;
    let elapsed = 0;
    let lastTime = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isReducedMotion = reducedMotion.matches;

    const draw = (now: number) => {
      const delta = Math.min(now - lastTime, 64);
      lastTime = now;
      if (!isReducedMotion) elapsed += delta / 1000;
      renderer?.resize();
      renderer?.render(elapsed);
      if (!isReducedMotion) animationFrame = requestAnimationFrame(draw);
    };
    const redraw = () => {
      cancelAnimationFrame(animationFrame);
      draw(performance.now());
    };
    const handleMotionChange = () => {
      isReducedMotion = reducedMotion.matches;
      redraw();
    };
    const resizeObserver = new ResizeObserver(redraw);
    const themeObserver = new MutationObserver(() => {
      renderer?.updatePalette();
      redraw();
    });

    resizeObserver.observe(canvas);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-astryx-theme'] });
    reducedMotion.addEventListener('change', handleMotionChange);
    redraw();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      reducedMotion.removeEventListener('change', handleMotionChange);
      renderer?.dispose();
    };
  }, [activity, canvasRef]);

  return supported;
}
