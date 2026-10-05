import { Token } from '@astryxdesign/core/Token';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import type { LinkChipsProps } from '../../contracts/props/link-chips';
import { PROTOTYPE_NOTICE } from '../shell/PrototypeNotice';
import styles from './ExploreComponents.module.css';

export function LinkChips({ label, links, active, variant }: LinkChipsProps) {
  return <nav aria-label={label} className={variant === 'tabs' ? styles.tabs : styles.chips}>
    {links.map((link) => {
      const token = <Token label={link.label} href={link.href} size="lg" className={styles.chip} />;
      const content = variant === 'chips' && link.href.startsWith('#explore/')
        ? <Tooltip content={PROTOTYPE_NOTICE} placement="above" hasHoverIndication={false}>{token}</Tooltip>
        : token;
      return <span key={link.id} data-explore-link={link.href} aria-current={active === link.id ? 'page' : undefined}
        className={styles.chipWrap}>{content}</span>;
    })}
  </nav>;
}
