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
| `rotationY` | – | Additional yaw in radians for cube/monolith compositions, read every frame from a host callback. |
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

- `material`: cut width, roughness, reflectance, edge, grain, core / cut / spill / diffusion / absorption / falloff, glow mode, incandescence, halo, body illumination, and optional `cornerRadius` (0 is fully sharp; omit it to use legacy `softCorners`).
- `intelligence`: mode (`dormant` / `thinking` / `awakening`), motion style, activity, flow speed, impulse, paused.
- `camera`: auto-rotate and its speed.

Numeric values ease between states (`transition="ease"`); discrete ones (glow mode, geometry such as cut
width, motion style) apply at once — the motion style and glow character have their own easing inside.
An unknown state name throws, listing the known ones. The built-in names (`idle`, `thinking`,
`awakening`, `incandescent`) are starting points; replace them freely.

**Not yet states:** camera pose and framing (composition), and `onSettled` notification.

## Material families

Brand Studio offers six procedural finishes with actual rendered thumbnails:

| Family | Reference | Character |
|---|---|---|
| Current | Existing implementation | Graphite in dark mode, frosted optical glass in light mode. |
| Ivory Ceramic | 01 | Opaque satin ceramic, shallow seam-local scattering and broad reflections. |
| Frosted Glass | 02 | Rough refraction, milky absorption and a longer scattering distance. |
| Opal Pearl | 03 | Dense optical ceramic with restrained grazing-angle thin-film interference. |
| Obsidian / amber | 07 Obsidian outside + 06 Amber Glass inside | A substantial shell with warm optical depth; increase translucency during activation. |
| Prismatic / spectral | 04 Prismatic Glass + 09 Spectral Glass | Expressive transmission, dispersion and procedural thin-film interference. Reserved for transformation or immersive use. |

05 Titanium, 08 Concrete Stone and 10 Multi-Spectral are reference alternatives, not additional picker entries.
`material.family` selects the finish. `gloss` runs from true matte (0: no specular, clearcoat or sheen)
to the family's glossy finish (1). Optional `translucency` is absolute 0–1 transmission; omit it for
family defaults. `spectral` controls iridescence and dispersion. Roughness, grain, light controls and
corner radius remain independent. These are shader/physical-material parameters, with no texture assets.
The thumbnails show reference settings, not the current live knob values, and pause after warmup.
Dark and light use different base colours, attenuation and lighting; equal values are not a promise of
identical perceived brightness. Resting/active material changes remain host-controlled settings;
geometry and orange seams remain state cues. Dispersion uses three's screen-space transmission,
not a volumetric spectral renderer; transparent canvases and lower quality tiers disable transmission.

01–03 and Spectral use neutral softboxes, with no coloured accent lights. Scattering is an exponential falloff
from structural openings, gated by cut illumination; body illumination adjusts local scattering,
not a face-wide emissive wash. Opacity remains 1. Transmission uses native rough-refraction sampling
and Beer–Lambert attenuation, with seam proximity approximating thinner optical paths. This is not
measured back-face thickness or full volumetric scattering. Their low-quality fallback remains
reflectively lit rather than adding uniform emission. No floor/contact-shadow geometry is introduced.
Geometry, bevel settings and camera remain untouched. Native Neutral tone mapping is retained.

Crack illumination samples travelling model-space wavefronts along actual openings, blending their contributions. Both
walls and adjacent scattering use that same source: quiet amber stretches transition into HDR
warm-white hotspots. This is a procedural illumination approximation, not a routed particle or
volumetric light simulation. Existing flow speed and pause control its clock; activity modulates
its energy. Cut illumination switches it off; spill and diffusion set the nearby response. In
Current/Obsidian, body light is now local to openings; Incandescent retains whole-body heat.

Detached cut faces use a narrow Gaussian beam across the edge, with soft end tapers and a reduced
ember. Distance attenuation is applied after source blending so broad exposed faces cannot become
bright stripes. Adjacent diffusion narrows as pieces detach; no geometry or bevel is added.
Pearl and Spectral use a neutral milky base and higher-index optical films. Their film response is
driven by viewing angle and nearby illumination, not noise-based colour bands. A bounded single-scatter
approximation carries native thin-film colour beneath the surface; it is not a volumetric simulation.

Render regression: `pnpm exec playwright test -c tests/materials.config.ts`. Ten identical-camera
material/appearance cases each capture seams enabled and disabled, plus three detached poses including
a second cut layout. Generate all twenty-three baselines
with `--update-snapshots=all`; every file is explicitly rewritten and counted in the log. An additional
in-environment frame-count check verifies movement while running and identical renders while paused.

## Live optical controls

Brand Studio exposes Material optics and Travelling seam light groups. Their ten multiplier
controls default to 1x, preserving each family's calibration: scattering strength/reach, optical
thickness, absorption distance, thin-film depth, dispersion, travel speed, hotspot focus/intensity
and cut-beam width. Scattering controls appear for reference optical materials only. Reset optics
and seam light restores these multipliers without replacing the material family, geometry or
existing light settings. A zero travel speed freezes wave travel; Pause intelligence also freezes
the underlying activity field. Host state transitions ease the same controls; Studio sliders apply
immediately. These remain shader approximations, not a new volumetric renderer.

## Quality tiers

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
