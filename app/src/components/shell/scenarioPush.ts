// How far a home alert's card travels into its conversation (theme/scenario-expand.css, `--scenario-push`): the question
// rising in under it starts that far down and travels up with it, so it reads as pushing the card (2026-10-31, direct
// feedback). Measured once the new state is committed — the card's old place against the opening's new one — and
// cleared when the transition ends.
const PUSH_PROPERTY = '--scenario-push';

export function trackScenarioPush(card: Element, transition: ViewTransition | undefined) {
  if (!transition) return;
  const from = card.getBoundingClientRect().top;
  const root = document.documentElement;
  transition.updateCallbackDone.then(() => {
    const opening = [...document.querySelectorAll<HTMLElement>('[data-scenario-opening]')].find((element) => element.offsetParent !== null);
    if (!opening) throw new Error('No visible scenario opening to measure the card’s travel against.');
    root.style.setProperty(PUSH_PROPERTY, `${from - opening.getBoundingClientRect().top}px`);
  }).catch((error: unknown) => console.error('Measuring the scenario card’s travel failed.', error));
  const clear = () => root.style.removeProperty(PUSH_PROPERTY);
  transition.finished.then(clear, clear);
}
