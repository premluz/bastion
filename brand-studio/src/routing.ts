import { useSyncExternalStore } from 'react';
import type { StagePage } from './scene/Stage';

const ROUTES: Record<StagePage, string> = { monolith: '#/', assembly: '#/assembly', cube: '#/cube', fractal: '#/fractal' };

function readPage(): StagePage {
  const hash = window.location.hash;
  const pages: readonly StagePage[] = ['assembly', 'cube', 'fractal'];
  return pages.find((page) => hash === ROUTES[page]) ?? 'monolith';
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

export function usePage(): StagePage {
  return useSyncExternalStore(subscribe, readPage);
}

export function navigate(page: StagePage): void {
  window.location.hash = ROUTES[page];
}

export function isStagePage(value: string): value is StagePage {
  return value === 'monolith' || value === 'assembly' || value === 'cube' || value === 'fractal';
}
