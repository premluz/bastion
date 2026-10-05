import { useEffect, useRef } from 'react';
import { useShowTouchesStore } from '../../engine/stores/showTouchesStore';
import styles from './TouchIndicators.module.css';

// "Show touches": one flat dot per active pointer, for demos and screen
// recordings. Dots are created and moved imperatively — they must track the
// finger every frame, which a React re-render per pointermove would lag —
// and positioned through CSS custom properties the stylesheet consumes.
// The layer is a manual popover so it sits in the top layer above the
// app's own modal dialogs; it is re-raised on each press and after each
// click (a click may have just opened a dialog above it). It never takes
// pointer events, so every touch still reaches the app.
export function TouchIndicators() {
  const enabled = useShowTouchesStore((state) => state.enabled);
  const layerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const layer = layerRef.current;
    if (!enabled || !layer) return;
    const dots = new Map<number, HTMLSpanElement>();
    const raise = () => {
      if (layer.matches(':popover-open')) layer.hidePopover();
      layer.showPopover();
    };
    const place = (dot: HTMLSpanElement, event: PointerEvent) => {
      dot.style.setProperty('--touch-x', `${event.clientX}px`);
      dot.style.setProperty('--touch-y', `${event.clientY}px`);
    };
    const down = (event: PointerEvent) => {
      raise();
      const dot = document.createElement('span');
      dot.className = styles.dot ?? '';
      place(dot, event);
      layer.append(dot);
      dots.set(event.pointerId, dot);
    };
    const move = (event: PointerEvent) => {
      const dot = dots.get(event.pointerId);
      if (dot) place(dot, event);
    };
    const release = (event: PointerEvent) => {
      const dot = dots.get(event.pointerId);
      if (!dot) return;
      dots.delete(event.pointerId);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
      dot.dataset.released = '';
    };
    const afterClick = () => { setTimeout(raise); };
    const options = { capture: true, passive: true } as const;
    window.addEventListener('pointerdown', down, options);
    window.addEventListener('pointermove', move, options);
    window.addEventListener('pointerup', release, options);
    window.addEventListener('pointercancel', release, options);
    window.addEventListener('click', afterClick, options);
    raise();
    return () => {
      window.removeEventListener('pointerdown', down, options);
      window.removeEventListener('pointermove', move, options);
      window.removeEventListener('pointerup', release, options);
      window.removeEventListener('pointercancel', release, options);
      window.removeEventListener('click', afterClick, options);
      dots.forEach((dot) => dot.remove());
      if (layer.matches(':popover-open')) layer.hidePopover();
    };
  }, [enabled]);
  return <div ref={layerRef} popover="manual" className={styles.layer} aria-hidden="true" />;
}
