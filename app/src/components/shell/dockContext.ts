// What the bottom dock offers (2026-10-30, direct feedback: the card view's way back lives at the bottom, where the
// navigation was, and the two trade places in one fluid move — "a good system", to be reused for contextual navigation).
// `root` is the app's own navigation; any other kind is a page's own controls, which take the dock's place while the
// page is open. Each dock draws the kinds it supports (MonolithNavigation draws `back`); the motion is shared
// (theme/dock-context.css).
export type DockContext =
  | { kind: 'root' }
  | { kind: 'back'; label: string; onBack: () => void };

export const ROOT_DOCK: DockContext = { kind: 'root' };
