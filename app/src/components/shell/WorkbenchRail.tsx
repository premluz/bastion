import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { useWorkbenchStore } from '../../engine/stores/workbenchStore';
import { PANE_META } from './paneMeta';

// Fixed-width icon rail (Phase 8G WO-1) — the VS Code-model activity-bar
// equivalent, toggling workbench panes open/collapsed. No dedicated
// Astryx rail/workbench primitive exists (astryx search "rail" /
// "workbench" / "activity bar" — closest hits are SideNav's own collapse
// affordance and generic/unrelated fallback matches), so this is a plain
// vertical IconButton stack per rule 5's "custom only for what Astryx
// lacks."
export function WorkbenchRail() {
  const panes = useWorkbenchStore((state) => state.panes);
  const togglePane = useWorkbenchStore((state) => state.togglePane);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-8)',
        padding: 'var(--space-8)',
        borderLeft: '1px solid var(--edge)',
      }}
    >
      {panes.map((pane) => {
        const meta = PANE_META[pane.kind];
        return (
          <IconButton
            key={pane.kind}
            label={meta.label}
            tooltip={meta.label}
            icon={<Icon icon={meta.icon} size="sm" />}
            variant={pane.open ? 'primary' : 'ghost'}
            onClick={() => togglePane(pane.kind)}
          />
        );
      })}
    </div>
  );
}
