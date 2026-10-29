import { useLayoutEffect, useRef, useState } from 'react';
import { MonolithOrb } from './MonolithOrb';
import { placeDockCube } from './dockCubeTravel';
import styles from './DockCube.module.css';
import type { AssemblyClock } from './useAssemblyClock';

export function DockCube({ mode, working, assembly }: { mode: string; working: boolean; assembly: AssemblyClock }) {
  const cube = useRef<HTMLSpanElement>(null);
  const previous = useRef<string | null>(null);
  const [navWorking, setNavWorking] = useState(false);
  useLayoutEffect(() => {
    const nav = document.querySelector('[data-dock-cube]');
    setNavWorking(nav?.getAttribute('data-cube-working') === 'true');
  });
  useLayoutEffect(() => {
    if (mode === 'conversation') return;
    const element = cube.current;
    const slot = document.querySelector(mode === 'composer' ? '[data-chat-cube]' : '[data-dock-cube]');
    if (element === null || !(slot instanceof HTMLElement)) throw new Error('Live dock cube slot unavailable');
    const changed = previous.current !== null && previous.current !== mode;
    placeDockCube(element, slot, mode === 'composer', changed);
    previous.current = mode;
    const observer = new ResizeObserver(() => {
      if (!element.getAnimations().some((animation) => animation.playState === 'running' || animation.playState === 'paused')) {
        placeDockCube(element, slot, mode === 'composer', false);
      }
    });
    observer.observe(slot);
    if (element.parentElement !== null) observer.observe(element.parentElement);
    return () => observer.disconnect();
  }, [mode]);
  return <div className={styles.layer} data-hidden={mode === 'conversation'} aria-hidden="true">
    <span ref={cube} className={styles.cube} data-live-dock-cube=""><MonolithOrb working={mode === 'idle' ? navWorking : working} assembly={assembly} /></span>
  </div>;
}
