import type { ReactNode } from 'react';
import { Carousel } from '@astryxdesign/core/Carousel';
import type { ContentGroupProps } from '../../contracts/props/content-group';
import { SectionHeading } from './SectionHeading';
import styles from './ExploreComponents.module.css';

export function ContentGroup({ title, href, layout, children }: ContentGroupProps & { children?: ReactNode }) {
  return <section className={layout === 'page' ? styles.page : styles.group} aria-label={title}>
    {title && <SectionHeading title={title} {...(href ? { href } : {})} />}
    {layout === 'cards' ? <Carousel className={styles.cards} gap={3} hasButtons={false} hasEdgeFade={false} hasSnap aria-label={title ?? 'Assets'}>{children}</Carousel>
      : <div className={layout === 'rows' ? styles.rows : styles.stack}>{children}</div>}
  </section>;
}
