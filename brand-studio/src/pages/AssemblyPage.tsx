import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Text } from '@astryxdesign/core/Text';
import { useEffect } from 'react';
import { useAssembly } from '../state/assemblyStore';
import { ParamSlider } from '../ui/ParamSlider';
import { withRelease } from '../monolith/assembly/shapeToShape';
import { phaseName } from '../monolith/assembly/timeline';
import { Transport } from '../ui/Transport';
import { TuningPanel } from '../ui/TuningPanel';
import { VariantPicker } from '../ui/VariantPicker';
import styles from '../ui/overlay.module.css';

function AssemblyControls() {
  const progress = useAssembly((s) => s.progress);
  const scrub = useAssembly((s) => s.scrub);
  const duration = useAssembly((s) => s.duration);
  const setDuration = useAssembly((s) => s.setDuration);

  return (
    <Collapsible
      trigger={
        <Text type="label" weight="medium">
          Assembly
        </Text>
      }
      defaultIsOpen
    >
      <div className={styles.controls}>
        <ParamSlider label="Progress" value={progress} min={0} max={1} step={0.001} format={(v) => `${Math.round(v * 100)}%`} onChange={scrub} />
        <ParamSlider label="Duration" value={duration} min={3} max={24} step={0.5} format={(v) => `${v.toFixed(1)} s`} onChange={setDuration} />
      </div>
    </Collapsible>
  );
}

export function AssemblyPage() {
  useEffect(() => {
    useAssembly.getState().replay();
    return () => useAssembly.getState().pause();
  }, []);

  return (
    <>
      <TuningPanel>
        <AssemblyControls />
      </TuningPanel>
      <div className={styles.dock}>
        <Transport phaseName={withRelease(phaseName)} />
        <VariantPicker />
      </div>
    </>
  );
}
