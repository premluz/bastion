import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav';
import { BrandMark } from './BrandMark';

// Mobile top bar (Phase 20, direct order overriding Phase 18 item 1's own
// closed "<768px permanently out of scope" decision — see CLAUDE.md's
// own Phase 20 entry for the full citation): a sticky hamburger + logo
// bar, Astryx's own TopNav passed as AppShell's `topNav` slot. Extracted
// out of Frame.tsx (which crossed the 200-line budget once this landed)
// so the composition and its own design rationale live in one small,
// focused file rather than inline JSX plus a long trailing comment.
//
// GATED at the CALL SITE (Frame.tsx), not internally: confirmed live (a
// genuine desktop regression caught before shipping) that AppShell
// renders WHATEVER `topNav` it's given at every width — it only switches
// TopNav's own internal "mobile-bar" render mode below its breakpoint,
// it does not suppress a custom topNav above it the way it suppresses
// the desktop sideNav rail below breakpoint (`showSideNavInline =
// hasSideNav && !isBelowBreakpoint`, confirmed by reading AppShell.js —
// no equivalent exists for a caller-supplied topNav). So Frame.tsx only
// passes this component to AppShell's `topNav` prop when its own
// `useMediaQuery('(max-width: 768px)')` check is true — this component
// itself carries no width logic of its own.
//
// BrandMark's own `isCollapsed` prop (true unconditionally here) is what
// makes it render as the minimized-state mark rather than nothing — the
// SAME mark component Sidebar.tsx already uses for its own collapsed-
// rail state, not a second logo asset. No explicit MobileNavToggle
// authored here — TopNav auto-injects its OWN hamburger in mobile-bar
// mode when it detects sideNav content via AppShell's context (confirmed
// live: an explicit MobileNavToggle alongside it produced two "Open
// navigation" buttons in the DOM, one genuinely laid out, one inert/
// zero-size — removing the explicit one leaves exactly one real,
// functioning toggle).
export function MobileTopNav() {
  return <TopNav label="Mobile navigation" heading={<TopNavHeading logo={<BrandMark isCollapsed />} />} />;
}
