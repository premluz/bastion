import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Badge } from '@astryxdesign/core/Badge';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { usePageStore } from '../../engine/stores/pageStore';
import styles from './NotificationBell.module.css';

// Sidebar footer control (Phase 8H, restyled to live in footerIcons
// alongside the profile trigger). Badge = alert-module turns whose
// artifact has never been opened (artifactStore.viewedArtifactIds is set
// the moment setOpenArtifact fires for that id — "unseen" genuinely means
// "never looked at," not a separate read/unread flag).
//
// Always renders now, disabled at zero rather than returning null —
// the earlier "hidden at zero" version was reported live as invisible
// chrome ("I can't see the notification icon"), the same honest-controls
// class ArtifactStackControl already settled: permanent chrome stays
// visible and truthfully disabled, only its badge is conditional. No
// bell icon exists in Astryx's closed set (exhibit 8) — "warning" stays
// the closest fit, unchanged from the prior version.
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
        label="Alerts"
        tooltip="Alerts"
        icon={<Icon icon="warning" size="sm" />}
        variant="ghost"
        isDisabled={unseenCount === 0}
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
