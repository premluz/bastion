import { useLayoutEffect, useRef } from 'react';
import styles from './BastionMonolith.module.css';

interface AppearanceFadeProps {
  readonly bitmap: ImageBitmap;
  readonly onDone: () => void;
}

/** The previous frame, laid over the stage and faded out, so Dark/Light changes dissolve instead of snap. */
export function AppearanceFade({ bitmap, onDone }: AppearanceFadeProps) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const el = canvas.current;
    if (el === null) return;
    el.width = bitmap.width;
    el.height = bitmap.height;
    const context = el.getContext('2d');
    if (context === null) throw new Error('Appearance crossfade: 2D canvas context unavailable');
    context.drawImage(bitmap, 0, 0);
  }, [bitmap]);

  return <canvas ref={canvas} className={styles.fade} onAnimationEnd={onDone} />;
}
