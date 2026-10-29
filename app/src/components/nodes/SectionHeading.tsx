import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { notifyPrototypeUnavailable } from '../shell/PrototypeNotice';
import styles from './ExploreComponents.module.css';

// The eyebrow section heading with its chevron link ("Trending >", "Perps >"), one
// markup for Explore's content groups and the wallet's Activity (2026-10-12, direct
// feedback: Activity styled like Trending/Perps). The destinations don't exist yet,
// so the link says so rather than looking clickable and doing nothing.
// `size="title"` (2026-10-23, direct feedback, attention home): a sentence-case title instead
// of the eyebrow, optionally with a count badge after it.
export function SectionHeading({ title, href, size = 'eyebrow', count }: { title: string; href?: string; size?: 'eyebrow' | 'title'; count?: number }) {
  return <h2 className={styles.heading} data-size={size} {...(size === 'eyebrow' ? { 'data-eyebrow': '' } : {})}>{href ? <Button label={title} href={href} data-explore-link={href}
      onClick={(event) => { event.preventDefault(); notifyPrototypeUnavailable(); }}
      variant="ghost" className={styles.headingLink} endContent={<Icon icon={ChevronRightIcon} size="sm" />} /> : title}
      {count !== undefined && <Badge label={count} variant="orange" className={styles.headingCount} />}</h2>;
}
