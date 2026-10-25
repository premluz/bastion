import { flowRate, intelligenceField, type IntelligenceField, type IntelligenceParams } from './field';
import type { JunctionMap } from './junctions';
import { approachLook, resolveLook, type Look } from './look';

/** Longest frame step fed to the clocks, so a backgrounded tab does not jump the motion. */
const MAX_STEP = 0.1;

/**
 * Owns the intelligence's two pausable clocks and its eased look. One per rendered monolith:
 * `step` once per frame, then `field` for the values to draw.
 */
export class IntelligenceDriver {
  private look: Look;
  private flowClock = 0;
  private eventClock = 0;

  /** Starts settled on the given target, so mounting never plays a transition. */
  constructor(params: IntelligenceParams, incandescence: number) {
    this.look = resolveLook(params, incandescence);
  }

  step(deltaSeconds: number, params: IntelligenceParams, incandescence: number, paused: boolean): void {
    const dt = Math.min(deltaSeconds, MAX_STEP);
    // The look keeps easing while paused; only time stops.
    this.look = approachLook(this.look, resolveLook(params, incandescence), dt);
    if (paused) return;
    this.flowClock += dt * flowRate(params, this.look);
    this.eventClock += dt;
  }

  field(map: JunctionMap, params: IntelligenceParams): IntelligenceField {
    return intelligenceField(map, this.flowClock, this.eventClock, params, this.look);
  }
}
