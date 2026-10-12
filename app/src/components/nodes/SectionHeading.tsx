import { useRef } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { PROTOTYPE_NOTICE, notifyPrototypeUnavailable } from '../shell/PrototypeNotice';
import styles from './ExploreComponents.module.css';

// The eyebrow section heading with its chevron link ("Trending >", "Perps >"), one
// markup for Explore's content groups and the wallet's Activity (2026-10-12, direct
// feedback: Activity styled like Trending/Perps). The destinations don't exist yet,
// so the link says so rather than looking clickable and doing nothing.
export function SectionHeading({ title, href }: { title: string; href?: string }) {
  const linkRef = useRef<HTMLButtonElement>(null);
  return <>
    <h2 className={styles.heading} data-eyebrow>{href ? <Button label={title} href={href} data-explore-link={href}
      ref={linkRef} onClick={(event) => { event.preventDefault(); notifyPrototypeUnavailable(); }}
      variant="ghost" className={styles.headingLink} endContent={<Icon icon={ChevronRightIcon} size="sm" />} /> : title}</h2>
    {href && <Tooltip anchorRef={linkRef} content={PROTOTYPE_NOTICE} placement="above" hasHoverIndication={false} />}
  </>;
}
