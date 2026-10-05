import { useState, type MouseEvent } from 'react';
import { resolveExploreScene } from '../../engine/exploreScenes';
import { notifyPrototypeUnavailable } from './PrototypeNotice';

export function useExploreNavigation() {
  const [category, setCategory] = useState('all');
  const [perps, setPerps] = useState('stocks');
  const [route, setRoute] = useState('');
  function onClick(event: MouseEvent<HTMLElement>) {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('[data-explore-link]');
    const href = link?.getAttribute('data-explore-link');
    if (!href?.startsWith('#explore/')) return;
    event.preventDefault();
    const [, kind, id] = href.split('/');
    if (kind === 'category' && id) { setCategory(id); setRoute(''); }
    else if (kind === 'perps' && id) setPerps(id);
    else notifyPrototypeUnavailable();
  }
  return { scene: resolveExploreScene(category, perps, route), onClick };
}
