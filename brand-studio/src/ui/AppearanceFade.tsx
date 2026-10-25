import { useLayoutEffect, useRef } from 'react';
import { useAppearanceFade } from '../state/appearanceFade';
import styles from './appearanceFade.module.css';

/** The previous frame, laid over the stage and faded out, so Dark/Light changes dissolve instead of snap. */
export function AppearanceFade() {
  const bitmap = useAppearanceFade((s) => s.bitmap);
  const token = useAppearanceFade((s) => s.token);
  const clear = useAppearanceFade((s) => s.clear);
  const canvas = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const el = canvas.current;
    if (bitmap === null || el === null) return;
    el.width = bitmap.width;
    el.height = bitmap.height;
    const context = el.getContext('2d');
    if (context === null) throw new Error('Appearance crossfade: 2D canvas context unavailable');
    context.drawImage(bitmap, 0, 0);
  }, [bitmap]);

  if (bitmap === null) return null;
  return <canvas key={token} ref={canvas} className={styles.fade} onAnimationEnd={clear} />;
}
