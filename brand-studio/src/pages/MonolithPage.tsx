import { TuningPanel } from '../ui/TuningPanel';
import { VariantPicker } from '../ui/VariantPicker';
import styles from '../ui/overlay.module.css';

export function MonolithPage() {
  return (
    <>
      <TuningPanel />
      <div className={styles.dock}>
        <VariantPicker />
      </div>
    </>
  );
}
