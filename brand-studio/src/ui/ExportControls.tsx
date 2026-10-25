import { Button } from '@astryxdesign/core/Button';
import { downloadDataUrl, downloadText, exportName } from '../scene/export/download';
import { monolithHandle } from '../state/monolithRef';
import { useStudio } from '../state/studioStore';
import { usePage } from '../routing';
import styles from './overlay.module.css';

export function ExportControls() {
  const page = usePage();
  const variant = useStudio((s) => s.variant);
  const appearance = useStudio((s) => s.appearance);
  const nameParts = page === 'monolith' || page === 'assembly' ? [page, variant, appearance] : [page, appearance];

  return (
    <div className={`${styles.panel} ${styles.headerGroup}`}>
      <Button
        label="Export PNG"
        variant="ghost"
        size="sm"
        clickAction={async () => downloadDataUrl(await monolithHandle().exportPng(), exportName(nameParts, 'png'))}
      />
      <Button
        label="Export SVG"
        variant="ghost"
        size="sm"
        clickAction={async () => downloadText(await monolithHandle().exportSvg(), exportName(nameParts, 'svg'), 'image/svg+xml')}
      />
    </div>
  );
}
