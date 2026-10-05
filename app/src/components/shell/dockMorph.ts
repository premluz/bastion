import { flushSync } from 'react-dom';
import '../../theme/dock-morph.css';

// The nav dock and the assistant composer are one persistent bar: a view
// transition stretches the glass pill into the composer (and back) while
// each side's icons stagger out and in (theme/dock-morph.css). Elements opt
// in through `view-transition-name`s; without API support or with reduced
// motion the mode simply switches. `types` (e.g. 'to-orb') let a stylesheet
// tune one morph via :active-view-transition-type(); browsers that predate
// transition types still get the plain morph.
const supportsTypes = typeof ViewTransition !== 'undefined' && 'types' in ViewTransition.prototype;

export function morphDock(update: () => void, types: string[] = []) {
  if (!('startViewTransition' in document) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }
  const toOrb = types.includes('to-orb');
  if (toOrb) document.documentElement.setAttribute('data-orb-morphing', 'true');
  const run = () => flushSync(update);
  let transition: ViewTransition;
  try {
    transition = types.length && supportsTypes
      ? document.startViewTransition({ update: run, types })
      : document.startViewTransition(run);
  } catch (error) {
    if (toOrb) document.documentElement.removeAttribute('data-orb-morphing');
    throw error;
  }
  if (toOrb) {
    const clearMorph = () => document.documentElement.removeAttribute('data-orb-morphing');
    void transition.finished.then(clearMorph, (error: unknown) => {
      clearMorph();
      console.error('Orb view transition failed.', error);
    });
  }
}
