import { useRef, type ReactNode } from 'react';
import { Carousel } from '@astryxdesign/core/Carousel';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { ContentGroupProps } from '../../contracts/props/content-group';
import { PROTOTYPE_NOTICE, notifyPrototypeUnavailable } from '../shell/PrototypeNotice';
import styles from './ExploreComponents.module.css';

export function ContentGroup({ title, href, layout, children }: ContentGroupProps & { children?: ReactNode }) {
  const headingRef = useRef<HTMLButtonElement>(null);
  return <section className={layout === 'page' ? styles.page : styles.group} aria-label={title}>
    {title && <h2 className={styles.heading}>{href ? <Button label={title} href={href} data-explore-link={href}
      ref={headingRef} onClick={(event) => { event.preventDefault(); notifyPrototypeUnavailable(); }}
      variant="ghost" className={styles.headingLink} endContent={<Icon icon={ChevronRightIcon} size="sm" />} /> : title}</h2>}
    {href && <Tooltip anchorRef={headingRef} content={PROTOTYPE_NOTICE} placement="above" hasHoverIndication={false} />}
    {layout === 'cards' ? <Carousel gap={3} hasButtons={false} hasEdgeFade={false} hasSnap aria-label={title ?? 'Assets'}>{children}</Carousel>
      : <div className={layout === 'rows' ? styles.rows : styles.stack}>{children}</div>}
  </section>;
}
