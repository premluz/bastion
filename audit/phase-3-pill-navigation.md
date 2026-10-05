# Alternate pill navigation — 2026-09-13

Added a separate controlled shell component, PillNavigation. The existing TabBar and MobileFrame wiring are unchanged.

Home, Explore, Assets and Assistant appear in that order as accessible icon-only buttons inside a rounded pill. The selected destination has a filled highlight. A detached + opens an above/end-aligned Astryx Popover with Add cash, Send, Receive and Trade; the plus rotates into a close cross and the destination pill dims while open. Selection closes the popover and calls the host's action callback. Escape, outside-click and the trigger dismiss it; focus restoration comes from Astryx.

Stories under Shell/PillNavigation: Default, Explore, Assets, Assistant and ActionsOpen. The harness demonstrates navigation selection and action callbacks without introducing additional financial screens. No dependencies added. Structural values and semantic border aliases live in theme/pill-navigation.css.

Gate: focused TypeScript, Storybook production build, token lint and diff checks passed. Four Chromium tests passed, covering destination order/selection, all actions, toggle/Escape/outside dismissal and 320px anchor positioning. Two element-scoped baselines were reviewed and passed again without updates. Tests account for Astryx Popover's documented-in-source 50ms hide/reopen guard. This component is preview-ready and intentionally not wired in place of the current nav.
