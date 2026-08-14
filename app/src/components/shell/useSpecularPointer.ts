import { useEffect } from 'react';

// Pointer-tracked specular highlight (direct order, 2026-08-06: "fake
// specular via a pointer-tracked gradient overlay").
//
// Why this needs JavaScript at all: CSS has no way to know where the pointer
// is inside an element. There is no pointer-position custom property and no
// selector that exposes coordinates — a gradient can be positioned by a
// custom property, but something has to write that property. This hook is
// the smallest thing that can: it writes --spec-x/--spec-y and nothing else.
//
// Why it lives in the shell rather than in the panes: registry components
// stay pure and dumb (CLAUDE.md rule 6) and the app shell is the one layer
// allowed to mount behaviour. Panes opt in with a data attribute; they never
// import this, and this never imports them.
//
// Why it writes custom properties instead of styles: rule 4's ban is on
// inline style props/objects deciding appearance. These two properties carry
// no appearance — they are pointer coordinates. Every visual decision (the
// gradient, its radius, its colour, whether it renders at all) stays in
// theme/module CSS, which is why --spec-alpha: 0 in the matte themes is
// enough to switch the whole effect off without this hook knowing themes
// exist.
const SURFACE_SELECTOR = '[data-glass-surface]';

export function useSpecularPointer(): void {
  useEffect(() => {
    // rAF-throttled: pointermove fires per input sample (120Hz+ on modern
    // trackpads), far faster than paint. Coalescing to one write per frame
    // is what keeps this from being a scroll-jank source — the visual result
    // is identical, since nothing can render between frames anyway.
    let frame = 0;
    let pending: { surface: HTMLElement; x: number; y: number } | null = null;
    // Tracked so the highlight can be cleared when the pointer leaves a
    // surface; without this the last position would stay lit after the
    // pointer moved away, reading as a stuck hotspot rather than a sweep.
    let lit: HTMLElement | null = null;

    const flush = () => {
      frame = 0;
      if (!pending) return;
      const { surface, x, y } = pending;
      pending = null;
      surface.style.setProperty('--spec-x', `${x}%`);
      surface.style.setProperty('--spec-y', `${y}%`);
    };

    const clear = (surface: HTMLElement) => {
      surface.style.removeProperty('--spec-x');
      surface.style.removeProperty('--spec-y');
    };

    const handleMove = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const surface = target?.closest<HTMLElement>(SURFACE_SELECTOR) ?? null;

      if (surface !== lit) {
        if (lit) clear(lit);
        lit = surface;
      }
      if (!surface) return;

      // Element-relative percentages, not viewport pixels: the gradient is
      // positioned in the surface's own coordinate space, so a percentage is
      // what the radial-gradient's `at` actually wants, and it stays correct
      // through pane resizes without recomputation.
      const rect = surface.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pending = {
        surface,
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };
      if (frame === 0) frame = requestAnimationFrame(flush);
    };

    // Pointer leaving the window entirely still has to unlight the surface —
    // pointermove alone never fires again once the cursor is outside, so the
    // highlight would freeze mid-sweep.
    const handleLeave = () => {
      if (lit) clear(lit);
      lit = null;
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    document.addEventListener('pointerleave', handleLeave);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerleave', handleLeave);
      if (frame !== 0) cancelAnimationFrame(frame);
      if (lit) clear(lit);
    };
  }, []);
}
