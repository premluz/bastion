import { flushSync } from 'react-dom';
import '../../theme/dock-morph.css';
import { cssDurationMs } from './cssDuration';

// The nav dock and the assistant composer are one persistent bar: a view
// transition stretches the glass pill into the composer (and back) while
// each side's icons stagger out and in (theme/dock-morph.css). Elements opt
// in through `view-transition-name`s; without API support or with reduced
// motion the mode simply switches. `types` (e.g. 'to-orb') let a stylesheet
// tune one morph via :active-view-transition-type(); browsers that predate
// transition types still get the plain morph.
const supportsTypes = typeof ViewTransition !== 'undefined' && 'types' in ViewTransition.prototype;

const ARRIVING = 'data-monolith-arriving';
const LEAVING = 'data-monolith-leaving';

export function morphDock(update: () => void, types: string[] = []) {
  if (!('startViewTransition' in document) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }
  // The monolith is a live WebGL canvas, which a transition snapshot can capture as a black shape, so it
  // stays out of every snapshot: hidden while the bar sinks (it emerges in the page once the transition
  // ends), and faded out live before the bar returns.
  if (types.includes('from-monolith')) {
    document.documentElement.setAttribute(LEAVING, '');
    window.setTimeout(() => {
      const transition = startMorph(update, types);
      const clear = () => document.documentElement.removeAttribute(LEAVING);
      void transition.finished.then(clear, (error: unknown) => {
        clear();
        console.error('Monolith view transition failed.', error);
      });
    }, cssDurationMs('--monolith-leave-duration'));
    return;
  }
  if (types.includes('to-monolith')) {
    document.documentElement.setAttribute(ARRIVING, '');
    let transition: ViewTransition;
    try {
      transition = startMorph(update, types);
    } catch (error) {
      document.documentElement.removeAttribute(ARRIVING);
      throw error;
    }
    void transition.finished.then(
      () => document.documentElement.removeAttribute(ARRIVING),
      (error: unknown) => {
        document.documentElement.removeAttribute(ARRIVING);
        console.error('Monolith view transition failed.', error);
      },
    );
    return;
  }
  startMorph(update, types);
}

function startMorph(update: () => void, types: string[]): ViewTransition {
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
  return transition;
}
