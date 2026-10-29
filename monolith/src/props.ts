import type { Ref } from 'react';
import type { Appearance, MonolithSettingsInput } from './settings';
import type { VariantId } from './monolith/geometry/types';
import type { Quality } from './quality';
import type { MonolithState } from './states';

/** What the object is made of. */
export type Composition =
  | { readonly kind: 'monolith'; readonly variant: VariantId; readonly assembly?: 'self' | 'cube' }
  | { readonly kind: 'cube'; readonly elements: number; readonly seed: number; readonly searchAttempts: number }
  | {
      readonly kind: 'fractal';
      readonly levels: number;
      readonly granularity: number;
      readonly seed: number;
      readonly searchAttempts: number;
    };

/**
 * How `progress` (0–1) is read.
 * - rest: the finished object; progress is ignored.
 * - shape-to-shape: assembled → apart → assembled, the formation turning once while apart.
 * - assemble: apart → assembled (and, for a fractal, the agent leaving), straight through.
 */
export type Sequence = 'rest' | 'shape-to-shape' | 'assemble';

export interface BastionMonolithHandle {
  /** The current frame as a PNG data URL, exactly as drawn (glow included). */
  exportPng(): Promise<string>;
  /** The current pose and view as a vector drawing; the glow is not representable and is omitted. */
  exportSvg(): Promise<string>;
  /** Eases the camera back to its default three-quarter view. */
  resetCamera(): void;
}

export interface BastionMonolithProps {
  readonly composition: Composition;
  /** Default `dark`. Changing it crossfades from the old look to the new one. */
  readonly appearance?: Appearance;
  /** Default `rest`. */
  readonly sequence?: Sequence;
  /** 0–1 along the sequence. A function is read every frame, so a host can drive it without re-rendering. */
  readonly progress?: number | (() => number);
  /** Additional yaw in radians for cube/monolith compositions, read every frame. */
  readonly rotationY?: () => number;
  /** A named state (from `states`, or the built-in ones) or an inline one. Applied over `settings`. */
  readonly state?: string | MonolithState;
  /** Extra or replacement named states; merged over the built-in ones. */
  readonly states?: Readonly<Record<string, MonolithState>>;
  /** Base overrides of the defaults, below the active state. */
  readonly settings?: MonolithSettingsInput;
  /** `ease` (default): numeric changes glide. `immediate`: apply at once, for direct manipulation like sliders. */
  readonly transition?: 'ease' | 'immediate';
  /** Default `high`. Lower tiers trade the glass and the sideways glow for frame rate. */
  readonly quality?: Quality;
  /** Orbit and zoom with the pointer; double-click resets. Default true. */
  readonly interactive?: boolean;
  /** Highest pixel ratio the canvas may use; overrides the quality tier's. A small canvas can afford the full device ratio. */
  readonly maxPixelRatio?: number;
  /** Fixed render pixel ratio, independent of display density; supersamples small canvases before browser downscaling. */
  readonly pixelRatio?: number;
  /**
   * Draw no background: the host's shows through, and the glow adds light over it. Glass transmission
   * is replaced by the lit-body fallback, since it would sample an empty backdrop. `ground` is ignored.
   */
  readonly transparent?: boolean;
  /** Stop rendering; the last frame stays. For a canvas that is hidden. Exports wait until it runs again. */
  readonly paused?: boolean;
  /** Camera zoom: 1 is the default view, 1.5 fills a small frame with the object. */
  readonly framing?: number;
  /**
   * Ground colour behind the object, per appearance (any CSS colour). It is drawn into the canvas and matched
   * through tone mapping, so the glow can spread onto it without a seam. Defaults to the brand grounds;
   * set it to the host's own background so they agree.
   */
  readonly ground?: Partial<Record<Appearance, string>>;
  /** Called every frame with the elapsed seconds, so a host can run its own clock. */
  readonly onFrame?: (deltaSeconds: number) => void;
  readonly className?: string;
  readonly ref?: Ref<BastionMonolithHandle>;
}
