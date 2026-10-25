# @bastion/monolith

The Bastion monolith — a real-time WebGL brand object — as one React component. Source-only workspace
package (no build step); the host's bundler compiles it.

```tsx
import { BastionMonolith } from '@bastion/monolith';

<BastionMonolith
  composition={{ kind: 'monolith', variant: 'step-angle' }}
  appearance="dark"
  state="thinking"
  quality="balanced"
/>
```

The component fills its parent (`width: 100%; height: 100%`), so give the parent a size. It reads no
global state: everything arrives as props.

## Props

| Prop | Default | |
|---|---|---|
| `composition` | required | What it is: `{kind:'monolith', variant}`, `{kind:'cube', elements, seed, searchAttempts}` or `{kind:'fractal', levels, granularity, seed, searchAttempts}`. |
| `appearance` | `'dark'` | `'dark'` or `'light'`. A change crossfades from the old look; reduced-motion skips the fade. |
| `sequence` | `'rest'` | How `progress` is read: `rest` (finished, progress ignored), `shape-to-shape` (assembled → apart → assembled, turning once while apart), `assemble` (apart → assembled; a fractal's agent then leaves). |
| `progress` | `1` | 0–1 along the sequence. A function is read every frame, so a host can drive it without re-rendering. |
| `state` | – | A named state or an inline one (see below). Applied over `settings`. |
| `states` | – | Extra or replacement named states, merged over the built-in ones. |
| `settings` | – | Base overrides of the defaults: `{ material?, intelligence?, camera? }`. Below the active state. |
| `transition` | `'ease'` | `'ease'`: numeric changes glide (~0.75 s). `'immediate'`: apply at once, for sliders. |
| `quality` | `'high'` | `'high'`, `'balanced'` or `'low'` — see below. |
| `interactive` | `true` | Pointer orbit and zoom; double-click resets the camera. |
| `transparent` | `false` | Draw no background: the host shows through and the glow adds light over it (glass transmission is replaced by a lit body). |
| `paused` | `false` | Stop rendering for a hidden canvas; the last frame stays. |
| `framing` | `1` | Camera zoom: 1.5 fills a small frame with the object. |
| `maxPixelRatio` | by tier | Highest pixel ratio; a small canvas can afford the full device ratio. |
| `ground` | brand grounds | Per-appearance background (hex), matched through tone mapping so the glow spreads onto it with no seam. Set it to the host's own background. |
| `onFrame` | – | Called every frame with elapsed seconds (clamped to 0.1), so a host can run its own clock. |
| `ref` | – | A `BastionMonolithHandle`: `exportPng()`, `exportSvg()`, `resetCamera()`. |

## States

A state is plain data — a partial of the settings — merged `defaults ← settings ← state`:

```ts
const states = {
  hero: { material: { halo: 0.5, glowMode: 'incandescent', incandescence: 0.8 }, intelligence: { mode: 'thinking' } },
};
<BastionMonolith composition={…} states={states} state="hero" />
```

- `material`: cut width, roughness, reflectance, edge, grain, core / cut / spill / diffusion / absorption / falloff, glow mode, incandescence, halo.
- `intelligence`: mode (`dormant` / `thinking` / `awakening`), motion style, activity, flow speed, impulse, paused.
- `camera`: auto-rotate and its speed.

Numeric values ease between states (`transition="ease"`); discrete ones (glow mode, geometry such as cut
width, motion style) apply at once — the motion style and glow character have their own easing inside.
An unknown state name throws, listing the known ones. The built-in names (`idle`, `thinking`,
`awakening`, `incandescent`) are starting points; replace them freely.

**Not yet states:** camera pose and framing (composition), and `onSettled` notification.

## Quality

| | pixel ratio | MSAA | sideways glow | glass transmission |
|---|---|---|---|---|
| `high` | 1–2 | 4 | yes | yes |
| `balanced` | 1–1.5 | 2 | yes | no (lit pearl body instead) |
| `low` | 1 | 0 | no | no |

Frame rate was measured only on a desktop Mac, at its 120 fps display cap, so the tiers are
**untested on a phone**. Test on a real device before shipping to iOS.

## Adopting it in the Bastion app

1. The app's closed dependency list (CLAUDE.md §5) lacks `three`, `@react-three/fiber`,
   `@react-three/drei`, `@react-three/postprocessing`, `postprocessing` — **needs approval**.
2. Brand colours in `src/brand/palette.ts` and `src/scene/appearance.ts` are hex; the app forbids hex in
   components, so move them to theme tokens when wiring it in.
3. As a scene node it needs a Zod prop schema, a registry entry and a Storybook story.
4. The studio (`brand-studio/`) is the reference consumer: its `scene/Stage.tsx` maps stores to props.

## Development

`pnpm --filter @bastion/monolith typecheck` and `… test`. Geometry, collision, motion, easing and
export are covered by tests; rendering is verified in a real browser through the studio.
