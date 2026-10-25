import { describe, expect, it } from 'vitest';
import { lightState } from '../assembly/timeline';
import { buildMonolith } from '../geometry/buildMonolith';
import { length, sub } from '../geometry/vec';
import { VARIANTS } from '../variants';
import { formationTurn, releaseThenAssemble } from '../assembly/shapeToShape';
import { IntelligenceDriver } from './driver';
import { intelligenceField, MAX_MOTES, type IntelligenceParams } from './field';

const PARAMS: IntelligenceParams = { activity: 0.25, flowSpeed: 0.18, impulse: 0.4, mode: 'thinking', style: 'currents' };
const STYLES_UNDER_TEST = ['drift', 'currents', 'convection', 'synapse'] as const;

describe.each(VARIANTS.map((v) => [v.name, v] as const))('%s intelligence', (_name, variant) => {
  const model = buildMonolith(variant, { cutWidth: 0.034, bevel: 0.008 });

  it('finds interior junctions on real cut walls and a core among them', () => {
    const { junctions, core } = model.junctions;
    expect(junctions.length).toBeGreaterThanOrEqual(2);
    for (const j of [...junctions, core]) expect(Math.max(...j.map(Math.abs))).toBeLessThan(0.9);
  });

  it('moves its energy continuously — no jumps between neighbouring instants', () => {
    for (let c = 0; c < 40; c += 0.37) {
      const params = { ...PARAMS, style: STYLES_UNDER_TEST[Math.floor(c) % STYLES_UNDER_TEST.length] ?? 'drift' };
      const a = intelligenceField(model.junctions, c, c, params);
      const b = intelligenceField(model.junctions, c + 0.002, c + 0.002, params);
      expect(a.motes).toHaveLength(MAX_MOTES);
      a.motes.forEach((m, k) => {
        const next = b.motes[k];
        if (next === undefined) throw new Error('mote missing');
        expect(length(sub(m.position, next.position))).toBeLessThan(0.02);
        expect(Math.abs(m.strength - next.strength)).toBeLessThan(0.02);
      });
    }
  });
});

describe('assembly light', () => {
  it('reveals from the core outward and is fully revealed once assembled', () => {
    let previous = -1;
    for (let t = 0; t <= 1; t += 0.01) {
      const reveal = lightState(t).reveal;
      expect(reveal).toBeGreaterThanOrEqual(previous);
      previous = reveal;
    }
    expect(lightState(0).reveal).toBeLessThan(0);
    expect(lightState(1).reveal).toBeGreaterThan(3);
  });
});

describe('shape to shape', () => {
  it('starts and ends assembled, apart in between, with no jumps', () => {
    expect(releaseThenAssemble(0)).toBe(1);
    expect(releaseThenAssemble(1)).toBe(1);
    expect(Math.min(...Array.from({ length: 101 }, (_, i) => releaseThenAssemble(i / 100)))).toBe(0);
    for (let p = 0; p < 1; p += 0.001) {
      expect(Math.abs(releaseThenAssemble(p + 0.001) - releaseThenAssemble(p))).toBeLessThan(0.02);
    }
  });

  it('turns the formation one full revolution, arriving as it started', () => {
    expect(formationTurn(0)).toBe(0);
    expect(formationTurn(1)).toBeCloseTo(Math.PI * 2);
  });
});

describe('calm motion', () => {
  it('never flashes: assembly light changes smoothly at every step', () => {
    const step = 0.002;
    for (let t = 0; t < 1; t += step) {
      const a = lightState(t);
      const b = lightState(t + step);
      expect(Math.abs(b.glow - a.glow)).toBeLessThan(0.02);
      expect(Math.abs(b.coreEmphasis - a.coreEmphasis)).toBeLessThan(0.02);
      expect(Math.abs(b.reveal - a.reveal)).toBeLessThan(0.05);
    }
  });

  it('never goes dark: the inner light holds an ember through the whole sequence', () => {
    for (let p = 0; p <= 1; p += 0.005) expect(lightState(releaseThenAssemble(p)).glow).toBeGreaterThanOrEqual(0.45);
  });
});

describe('eased look', () => {
  const settled: IntelligenceParams = { activity: 0.25, flowSpeed: 0.18, impulse: 0.4, mode: 'dormant', style: 'drift' };
  const model = buildMonolith(VARIANTS[0]!, { cutWidth: 0.034, bevel: 0.008 });

  it('changing mode, style and glow character moves values gradually, never in one step', () => {
    const target: IntelligenceParams = { ...settled, mode: 'thinking', style: 'synapse' };
    const read = (d: IntelligenceDriver): number[] => {
      const f = d.field(model.junctions, target);
      return [f.incandescence, f.exterior, f.contrast, f.veil, f.stretch, f.plasmaScale, f.moteSpread];
    };
    const run = (frames: number): { start: number[]; end: number[]; steps: number[][] } => {
      const d = new IntelligenceDriver(settled, 0);
      const start = read(d);
      const steps: number[][] = [];
      let last = start;
      for (let i = 0; i < frames; i += 1) {
        d.step(1 / 60, target, 0.8, false);
        const now = read(d);
        steps.push(now.map((v, k) => Math.abs(v - (last[k] ?? 0))));
        last = now;
      }
      return { start, end: last, steps };
    };
    const { start, end, steps } = run(600);
    start.forEach((from, k) => {
      const travel = Math.abs((end[k] ?? 0) - from);
      if (travel < 1e-6) return;
      const largestShare = Math.max(...steps.map((step) => (step[k] ?? 0) / travel));
      expect(largestShare, `value ${k}`).toBeLessThan(0.05);
    });
    expect(end[0]).toBeCloseTo(0.8, 2);
    expect(end[2]).toBeCloseTo(1, 2);
  });

  it('keeps the flow clock continuous when the tempo changes', () => {
    const driver = new IntelligenceDriver(settled, 0);
    const target: IntelligenceParams = { ...settled, mode: 'thinking' };
    let last = driver.field(model.junctions, settled).drift;
    for (let i = 0; i < 240; i += 1) {
      driver.step(1 / 60, target, 0, false);
      const drift = driver.field(model.junctions, target).drift;
      expect(drift - last).toBeLessThan(0.1);
      expect(drift).toBeGreaterThanOrEqual(last);
      last = drift;
    }
  });

  it('does not play a transition on mount', () => {
    const target: IntelligenceParams = { ...settled, mode: 'thinking', style: 'currents' };
    const driver = new IntelligenceDriver(target, 0.7);
    expect(driver.field(model.junctions, target).incandescence).toBeCloseTo(0.7, 6);
  });
});
