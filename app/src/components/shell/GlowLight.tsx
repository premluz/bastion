import { Icon } from '@astryxdesign/core/Icon';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { AssistantOrb } from './AssistantOrb';
import { ContainedOrb } from './ContainedOrb';
import '../../theme/agent-dock.css';
import '../../theme/glow-dock.css';
import styles from './GlowLight.module.css';

// The glow home's light (2026-10-10): a soft ambient glow with the plasma orb in
// it, low on the bottom edge. One component for the open composer and voice mode,
// so both show the same light (direct feedback: the voice orb differed). How
// revealed it is comes from the inherited `--glow-reveal` (0 → 1); `isOpen` plays
// the snap.
// Two looks (2026-10-23, direct feedback with a reference): `plasma`, the free light
// dissolving into the page, and `contained`, the same plasma held in a glass circle that
// rises from the bottom edge, with a chevron hinting the swipe up. `none` keeps only the
// ambient light, for a home whose orb sits in the navigation instead.
export type GlowOrbStyle = 'plasma' | 'contained' | 'none';

export function GlowLight({ isOpen, orb = 'plasma' }: { isOpen: boolean; orb?: GlowOrbStyle }) {
  return (
    <div className={styles.light} data-open={isOpen ? '' : undefined} data-orb={orb} aria-hidden="true">
      <div className={styles.ambient} />
      {orb === 'contained' && <div className={styles.contained}>
        <ContainedOrb />
        <span className={styles.chevron}><Icon icon={ChevronUpIcon} size="sm" /></span>
      </div>}
      {orb === 'plasma' && <div className={styles.glow}><AssistantOrb variant="unbounded" /></div>}
    </div>
  );
}
