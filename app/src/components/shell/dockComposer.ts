/** Capture the visible pill before React replaces it, while the arriving composer remains interactive. */
export function prepareComposerTravel(): () => void {
  const nav = document.querySelector('[data-testid="pill-navigation"] nav');
  if (!(nav instanceof HTMLElement)) throw new Error('Composer travel requires the visible navigation pill');
  const source = nav.getBoundingClientRect();
  return () => {
    const body = document.querySelector('.astryx-chat-composer > div');
    if (!(body instanceof HTMLElement)) throw new Error('Composer travel requires its arriving surface');
    const target = body.getBoundingClientRect();
    if (target.width <= 0 || source.width <= 0) throw new Error('Composer travel has invalid surface bounds');
    body.style.setProperty('--dock-composer-from-x', `${source.x - target.x}px`);
    body.style.setProperty('--dock-composer-from-y', `${source.y - target.y}px`);
    body.style.setProperty('--dock-composer-from-scale', String(source.width / target.width));
  };
}
