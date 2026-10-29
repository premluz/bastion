import { createRoot } from 'react-dom/client';
import { useCallback, useRef, useState } from 'react';
import { BastionMonolith, MATERIAL_FAMILIES } from '@bastion/monolith';
import './material-check.css';

const SETTLE_FRAMES = 24;
const DETACHED_PROGRESS = 0.32;
const query = new URLSearchParams(location.search);
const motion = query.has('motion');
const captureFrames = query.has('later') ? SETTLE_FRAMES * 4 : SETTLE_FRAMES;
const family = MATERIAL_FAMILIES.find((item) => item.id === query.get('family'))?.id;
if (family === undefined) throw new Error('Material validation requires a registered family');
const appearance = query.get('appearance') === 'dark' ? 'dark' : 'light';
const material = { family, cornerRadius: 0, halo: 0, bodyLight: 0.52, cutLight: query.has('unlit') ? 0 : 0.82 };
const composition = { kind: 'monolith', variant: query.has('alternate') ? 'double-straight' : 'step-angle' } as const;

function MaterialCheck() {
  const frames = useRef(0);
  const [ready, setReady] = useState(false);
  const tick = useCallback(() => {
    frames.current += 1;
    if (frames.current === captureFrames) setReady(true);
  }, []);
  return <main data-ready={ready} data-progress={query.has('open') ? DETACHED_PROGRESS : 1}>
    <BastionMonolith composition={composition} appearance={appearance} interactive={false}
      sequence={query.has('open') ? 'assemble' : 'rest'} progress={DETACHED_PROGRESS}
      settings={{ material, intelligence: { paused: !motion, activity: 0.8, impulse: 0, flowSpeed: 0.6 } }}
      transition="immediate" maxPixelRatio={1} onFrame={tick} paused={ready} />
  </main>;
}

const root = document.getElementById('root');
if (root === null) throw new Error('Material validation root missing');
createRoot(root).render(<MaterialCheck />);
