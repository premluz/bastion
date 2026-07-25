import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Badge } from '@astryxdesign/core/Badge';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { usePageStore } from '../../engine/stores/pageStore';
import { BellIcon } from './BellIcon';
import styles from './NotificationBell.module.css';

// Sidebar footer control (Phase 8H, restyled to live in footerIcons).
// Badge = alert-module turns whose artifact has never been opened
// (artifactStore.viewedArtifactIds is set the moment setOpenArtifact
// fires for that id — "unseen" genuinely means "never looked at," not a
// separate read/unread flag).
//
// Always renders, never disabled — reported live twice now: first as
// invisible chrome when it returned null at zero (fixed by always
// rendering), then as reading disabled/inert even once visible, since a
// zero count also gated `isDisabled`. A real destination exists
// regardless of count (Monitor's own history is worth checking even with
// nothing new), so this stays a genuine, hoverable, always-enabled
// control — only its badge is conditional, same "permanent chrome, honest
// state" class ArtifactStackControl already settled. Icon/copy: a real
// BellIcon (see its own comment — exhibit 8, no bell in Astryx's closed
// set) and "Notifications," not the "warning"-icon/"Alerts" stand-in,
// which read as an actual warning rather than a notifications affordance.
export function NotificationBell() {
  const turns = useSessionStore((state) => state.turns);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const viewedArtifactIds = useArtifactStore((state) => state.viewedArtifactIds);
  const navigateToModule = usePageStore((state) => state.navigateToModule);

  const unseenCount = turns.filter((turn) => {
    const artifact = turn.artifactRef ? artifacts[turn.artifactRef] : undefined;
    return artifact?.module === 'monitor' && turn.artifactRef && !viewedArtifactIds[turn.artifactRef];
  }).length;

  return (
    <div className={styles.wrapper}>
      <IconButton
        label="Notifications"
        tooltip="Notifications"
        icon={<Icon icon={BellIcon} size="sm" />}
        variant="ghost"
        onClick={() => navigateToModule('monitor')}
      />
      {unseenCount > 0 && (
        <div className={styles.badgeWrapper}>
          <Badge variant="neutral" label={String(unseenCount)} />
        </div>
      )}
    </div>
  );
}
