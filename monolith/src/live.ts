import type { MonolithSettings } from './settings';

/**
 * The settings in force. `target` is what was asked for (changes re-render, and drives geometry and
 * discrete choices). `eased` is the same, with numeric values gliding toward it; it is updated every
 * frame without re-rendering, and is what per-frame drawing reads.
 */
export interface LiveSettings {
  readonly target: MonolithSettings;
  readonly eased: { current: MonolithSettings };
}
