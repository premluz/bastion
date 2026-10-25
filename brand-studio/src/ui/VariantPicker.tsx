import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { isVariantId, VARIANTS } from '@bastion/monolith';
import { useStudio } from '../state/studioStore';
import styles from './overlay.module.css';

export function VariantPicker() {
  const variant = useStudio((s) => s.variant);
  const setVariant = useStudio((s) => s.setVariant);

  return (
    <div className={`${styles.panel} ${styles.scrollRow}`}>
      <SegmentedControl
        label="Split variant"
        value={variant}
        onChange={(value) => {
          if (isVariantId(value)) setVariant(value);
        }}
      >
        {VARIANTS.map((v) => (
          <SegmentedControlItem key={v.id} value={v.id} label={`${v.code}  ${v.name}`} />
        ))}
      </SegmentedControl>
    </div>
  );
}
