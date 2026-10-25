import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Text } from '@astryxdesign/core/Text';
import { useEffect } from 'react';
import { cubePhaseName } from '../fractal/assembly/fractalTimeline';
import { CUBE_COUNT } from '../fractal/geometry/cubeLayout';
import { useAssembly } from '../state/assemblyStore';
import { useCube } from '../state/cubeStore';
import { ParamSlider } from '../ui/ParamSlider';
import { withRelease } from '../monolith/assembly/shapeToShape';
import { Transport } from '../ui/Transport';
import { TuningPanel } from '../ui/TuningPanel';
import styles from '../ui/overlay.module.css';

const CUBE_DURATION = 12;
const whole = (v: number): string => String(Math.round(v));

function CubeControls() {
  const count = useCube((s) => s.count);
  const trials = useCube((s) => s.trials);
  const seed = useCube((s) => s.seed);
  const set = useCube((s) => s.set);
  const duration = useAssembly((s) => s.duration);
  const setDuration = useAssembly((s) => s.setDuration);

  return (
    <Collapsible
      trigger={
        <Text type="label" weight="medium">
          Cube
        </Text>
      }
      defaultIsOpen
    >
      <div className={styles.controls}>
        <ParamSlider label="Elements" value={count} min={CUBE_COUNT.min} max={CUBE_COUNT.max} step={1} format={whole} onChange={(v) => set({ count: v })} />
        <ParamSlider label="Search attempts" value={trials} min={0} max={3} step={1} format={whole} onChange={(v) => set({ trials: v })} />
        <ParamSlider label="Pattern seed" value={seed} min={1} max={99} step={1} format={whole} onChange={(v) => set({ seed: v })} />
        <ParamSlider label="Duration" value={duration} min={4} max={30} step={0.5} format={(v) => `${v.toFixed(1)} s`} onChange={setDuration} />
      </div>
    </Collapsible>
  );
}

export function CubePage() {
  useEffect(() => {
    const store = useAssembly.getState();
    const previous = store.duration;
    store.setDuration(CUBE_DURATION);
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
        <CubeControls />
      </TuningPanel>
      <div className={styles.dock}>
        <Transport phaseName={withRelease(cubePhaseName)} />
      </div>
    </>
  );
}
