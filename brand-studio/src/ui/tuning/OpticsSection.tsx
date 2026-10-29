import { Button } from '@astryxdesign/core/Button';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Text } from '@astryxdesign/core/Text';
import { DEFAULT_OPTICAL_TUNING, OPTICAL_CONTROLS, OPTICAL_TUNING_KEYS, isReferenceMaterial } from '@bastion/monolith';
import { useStudio } from '../../state/studioStore';
import styles from '../overlay.module.css';
import { ParamSlider } from '../ParamSlider';
import { SectionTitle } from './SectionTitle';

const GROUPS = [
  { id: 'material', title: 'Material optics' },
  { id: 'seams', title: 'Travelling seam light' },
] as const;
const multiplier = (value: number): string => value.toFixed(2) + '×';

export function OpticsSection() {
  const material = useStudio((s) => s.material);
  const set = useStudio((s) => s.setMaterial);
  return <>
    {GROUPS.map((group) => (
      <Collapsible key={group.id} trigger={<SectionTitle title={group.title} />} defaultIsOpen>
        <div className={styles.controls}>
          <Text type="supporting" color="secondary">1× follows the selected material preset.</Text>
          {OPTICAL_TUNING_KEYS.filter((key) => OPTICAL_CONTROLS[key].group === group.id
            && (!OPTICAL_CONTROLS[key].referenceOnly || isReferenceMaterial(material.family))).map((key) => {
            const control = OPTICAL_CONTROLS[key];
            return <ParamSlider key={key} label={control.label} value={material[key] ?? DEFAULT_OPTICAL_TUNING[key]}
              min={control.min} max={control.max} step={control.step} format={multiplier}
              onChange={(value) => set({ [key]: value })} />;
          })}
        </div>
      </Collapsible>
    ))}
    <Button label="Reset optics & seam light" variant="secondary" size="sm" onClick={() => set(DEFAULT_OPTICAL_TUNING)} />
  </>;
}
