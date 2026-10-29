import { Token } from '@astryxdesign/core/Token';
import type { LinkChipsProps } from '../../contracts/props/link-chips';
import styles from './ExploreComponents.module.css';

export function LinkChips({ label, links, active, variant }: LinkChipsProps) {
  return <nav aria-label={label} className={variant === 'tabs' ? styles.tabs : styles.chips}>
    {links.map((link) => {
      const token = <Token label={link.label} href={link.href} size="lg" className={styles.chip} />;
      return <span key={link.id} data-explore-link={link.href} aria-current={active === link.id ? 'page' : undefined}
        className={styles.chipWrap}>{token}</span>;
    })}
  </nav>;
}
