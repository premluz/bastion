import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../trail/LabelReveal';
import { playChatSweep } from './chatSweepRenderer';
import '../../theme/chat-sweep.css';
import styles from './ChatSweep.module.css';

interface Sweep { wasOpen: boolean; id: number }

// Opening the assistant sweeps an iridescent band across the screen (theme/chat-sweep.css). The canvas exists only while
// a sweep runs, and mounts in the same commit as the opening, so the opening's view transition captures it. Not under
// reduced motion.
export function ChatSweep({ isOpen }: { isOpen: boolean }) {
  const [sweep, setSweep] = useState<Sweep>({ wasOpen: isOpen, id: 0 });
  const [running, setRunning] = useState(0);
  if (sweep.wasOpen !== isOpen) {
    const starts = isOpen && !prefersReducedMotion();
    setSweep({ wasOpen: isOpen, id: starts ? sweep.id + 1 : sweep.id });
    if (starts) setRunning(sweep.id + 1);
  }
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (running === 0 || !canvas.current) return;
    const played = playChatSweep(canvas.current);
    if (!played) { setRunning(0); return; }
    const end = () => setRunning((current) => (current === running ? 0 : current));
    played.finished.then(end, (error: unknown) => {
      // Cancelled when this sweep is replaced or unmounted: expected. Anything else is a real failure.
      if (!(error instanceof DOMException && error.name === 'AbortError')) throw error;
      end();
    });
    return played.cancel;
  }, [running]);
  return running === 0 ? null : <canvas key={running} ref={canvas} className={styles.sweep} aria-hidden="true" />;
}
