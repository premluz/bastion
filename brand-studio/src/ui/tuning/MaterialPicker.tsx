import { SelectableCard } from '@astryxdesign/core/SelectableCard';
import { MATERIAL_FAMILIES } from '@bastion/monolith';
import { useStudio } from '../../state/studioStore';
import { MaterialPreview } from './MaterialPreview';
import styles from './materials.module.css';

export function MaterialPicker() {
  const family = useStudio((s) => s.material.family);
  const appearance = useStudio((s) => s.appearance);
  const set = useStudio((s) => s.setMaterial);
  const selected = MATERIAL_FAMILIES.find((item) => item.id === family);
  return (
    <div className={styles.root}>
      <div className={styles.grid} role="group" aria-label="Material family">
        {MATERIAL_FAMILIES.map((item) => (
          <SelectableCard key={item.id} label={item.label} isSelected={item.id === family}
            onChange={() => set({ family: item.id })} padding={0}>
            <MaterialPreview key={`${item.id}-${appearance}`} family={item.id} appearance={appearance} />
            <span className={styles.label}>{item.label}</span>
          </SelectableCard>
        ))}
      </div>
      <p className={styles.description}>{selected?.description}</p>
    </div>
  );
}
