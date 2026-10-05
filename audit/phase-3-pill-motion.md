# Pill navigation motion — 2026-09-13

PillNavigation now accepts a persistent composer slot and isComposerOpen state. The composer opens underneath the nav using a grid-height reveal, fade and short translation, with the existing assistant gradient behind the dock. Collapsed content is inert and hidden from accessibility APIs. The Assistant control exposes expanded/controls attributes. The interactive story reuses ChatBarComposer, focuses it on opening, preserves drafts and demonstrates submission. Added ComposerOpen entry story; previous TabBar remains untouched.

Replaced per-button active fills with one translating indicator. Its inner shape stretches to 118% width during a 480ms eased move, then returns to normal. Separating translation and stretch lets rapid destination changes retarget the current position. Reduced motion disables both effects. Timing and stretch use pill-navigation theme tokens; no dependency or inline style was added.

Gate: focused TypeScript, Storybook build, token lint and diff checks pass. Seven Chromium tests pass, including composer geometry/draft preservation/submission, stretch keyframes, rapid retargeting, reduced motion and existing popover behavior. Three screenshot baselines pass without updates in the final run. Geometry during motion is sampled in a single browser evaluation to avoid comparing different animation frames.
