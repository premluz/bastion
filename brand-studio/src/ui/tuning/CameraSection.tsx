import { Button } from '@astryxdesign/core/Button';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Switch } from '@astryxdesign/core/Switch';
import { monolithHandle } from '../../state/monolithRef';
import { useStudio } from '../../state/studioStore';
import { RecenterIcon } from '../icons';
import styles from '../overlay.module.css';
import { ParamSlider } from '../ParamSlider';
import { SectionTitle } from './SectionTitle';

export function CameraSection() {
  const autoRotate = useStudio((s) => s.autoRotate);
  const setAutoRotate = useStudio((s) => s.setAutoRotate);
  const rotationSpeed = useStudio((s) => s.rotationSpeed);
  const setRotationSpeed = useStudio((s) => s.setRotationSpeed);

  return (
    <Collapsible trigger={<SectionTitle title="Camera" />} defaultIsOpen>
      <div className={styles.controls}>
        <Switch label="Auto-rotate" value={autoRotate} onChange={setAutoRotate} labelSpacing="spread" />
        <ParamSlider label="Rotation speed" value={rotationSpeed} min={0.1} max={4} step={0.1} format={(v) => v.toFixed(1)} onChange={setRotationSpeed} />
        <Button label="Reset camera" variant="secondary" size="sm" icon={<RecenterIcon />} onClick={() => monolithHandle().resetCamera()} />
      </div>
    </Collapsible>
  );
}
