import { Button } from '@astryxdesign/core/Button';
import { useExport } from '../state/exportStore';
import styles from './overlay.module.css';

export function ExportControls() {
  const request = useExport((s) => s.request);
  return (
    <div className={`${styles.panel} ${styles.headerGroup}`}>
      <Button label="Export PNG" variant="ghost" size="sm" onClick={() => request('png')} />
      <Button label="Export SVG" variant="ghost" size="sm" onClick={() => request('svg')} />
    </div>
  );
}
