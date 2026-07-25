---
name: merlin-theme-token
description: Any token, theme, color, blur, motion, spacing, or glass/ops-dark visual change in Merlin. Trigger on "token", "theme", "glass", "contrast", "blur", "too dark/light", "restyle", or any request to change how something looks.
---

# Theme & token changes — procedure

Guardrails and CLAUDE.md apply. Prime directive: visual problems are fixed in theme/token files. If a component file must change to fix a visual issue, the token architecture has a gap — report it, propose the token, wait.

## 1. Locate the tier
- **Primitive** (`tokens.base.css`): raw scales only — spacing, type, durations, easings, z-depth, blur/opacity scales. Theme-agnostic. Touch only when adding a scale step.
- **Semantic** (theme files): meaning-carrying (`--surface-2`, `--accent-signal`, `--edge-highlight`). Default tier for new tokens.
- **Component token**: last resort, only when no semantic token can express it.
- New value goes to the **lowest tier that expresses it**; semantic tokens reference primitives, never raw values.
- When authoring a semantic accent, verify contrast against the LIGHTEST surface a theme can produce, not just the theme you're actively looking at — a token correct in one theme's context can render illegibly in another's, even without any theme-specific value change. (Ratified 2026-07-18, Phase 12 WO-1.5: `--accent-signal` read as near-white against `default` theme's own native palette — not a bug, but only caught by checking computed fill values directly, not by eyeballing a single theme's screenshot.)

## 2. Change protocol
- Every semantic/component token exists in EVERY registered theme file in the same change — no theme drifts.
- Overriding an Astryx cascade variable → log it in `theme/astryx-bridge.md` (variable, both values, reason).
- Motion: only durations/easings from primitives. No bespoke cubic-beziers in theme files.
- Pin color-scheme explicitly per theme — light-dark() silently follows the viewer's OS otherwise. Dev-only overrides (inline styles, Storybook toolbars) must be conditional on the states they're allowed in: inline styles beat every stylesheet rule and silently break scheme/theme locks.
- The canvas rule (`:where(html, body)`) must set `--face-ui` explicitly — a design system's own text classes never guarantee total coverage; anything unwrapped falls through to browser defaults. Every SVG `<text>` sets its face at birth.

## 3. Glass rules
- Surfaces: `--surface-opacity` 0.4–0.7 + `backdrop-filter: blur(var(--surface-blur))`. Depth = z-depth shadow + blur pairing, edge-highlight on top edges only.
- Legibility floor: data ink must hold contrast on the blurred surface over the busiest canvas background. Fails → raise that surface's scrim token. Never darken ink per-component, never hardcode.

## 4. Verify
- Token sheet story reflects the change in both themes.
- Flip every fixture scene ops-dark ↔ glass; confirm the change lands everywhere intended and nowhere else.
- Grep confirms no component file changed and no raw value entered a theme file where a primitive exists.

## Done report
Tokens added/changed (tier) · both-themes confirmation · Astryx bridge entries · audit result.
