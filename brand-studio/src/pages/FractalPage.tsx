import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Text } from '@astryxdesign/core/Text';
import { useEffect } from 'react';
import { phaseNameFor } from '@bastion/monolith';
import { useAssembly } from '../state/assemblyStore';
import { useFractal } from '../state/fractalStore';
import { ParamSlider } from '../ui/ParamSlider';
import { Transport } from '../ui/Transport';
import { TuningPanel } from '../ui/TuningPanel';
import styles from '../ui/overlay.module.css';

/** The fractal sequence has more to show than the four-piece assembly, so it runs longer by default. */
const FRACTAL_DURATION = 18;
const whole = (v: number): string => String(Math.round(v));

function FractalControls() {
  const levels = useFractal((s) => s.levels);
  const granularity = useFractal((s) => s.granularity);
  const trials = useFractal((s) => s.trials);
  const seed = useFractal((s) => s.seed);
  const set = useFractal((s) => s.set);
  const duration = useAssembly((s) => s.duration);
  const setDuration = useAssembly((s) => s.setDuration);

  return (
    <Collapsible
      trigger={
        <Text type="label" weight="medium">
          Fractal
        </Text>
      }
      defaultIsOpen
    >
      <div className={styles.controls}>
        <ParamSlider label="Levels" value={levels} min={1} max={3} step={1} format={whole} onChange={(v) => set({ levels: v })} />
        <ParamSlider label="Granularity" value={granularity} min={1} max={3} step={1} format={whole} onChange={(v) => set({ granularity: v })} />
        <ParamSlider label="Search attempts" value={trials} min={0} max={3} step={1} format={whole} onChange={(v) => set({ trials: v })} />
        <ParamSlider label="Pattern seed" value={seed} min={1} max={99} step={1} format={whole} onChange={(v) => set({ seed: v })} />
        <ParamSlider label="Duration" value={duration} min={6} max={36} step={0.5} format={(v) => `${v.toFixed(1)} s`} onChange={setDuration} />
      </div>
    </Collapsible>
  );
}

export function FractalPage() {
  useEffect(() => {
    const store = useAssembly.getState();
    const previous = store.duration;
    store.setDuration(FRACTAL_DURATION);
    store.replay();
    return () => {
      const current = useAssembly.getState();
      current.pause();
      current.setDuration(previous);
    };
  }, []);

  return (
    <>
      <TuningPanel>
        <FractalControls />
      </TuningPanel>
      <div className={styles.dock}>
        <Transport phaseName={phaseNameFor('fractal', 'assemble')} />
      </div>
    </>
  );
}
