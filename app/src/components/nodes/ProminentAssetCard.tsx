import type { ReactNode } from 'react';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { CoinLogo } from './CoinLogo';
import { TrendDelta } from './TrendDelta';
import type { ProminentAssetCardProps } from '../../contracts/props/prominent-asset-card';
import { PROTOTYPE_NOTICE } from '../shell/PrototypeNotice';
import styles from './ExploreComponents.module.css';

export function ProminentAssetCard(props: ProminentAssetCardProps & { children?: ReactNode }) {
  const card = <div data-explore-link={props.href}><ClickableCard label={`${props.symbol} ${props.variant === 'earn' ? 'earn' : 'perpetual'}`}
    href={props.href} padding={4} className={styles.prominent}>
    <div className={styles.cardContent}>
      <CoinLogo entityId={props.entityId} label={props.symbol} />
      <div className={styles.identity}>
        <span className={styles.name}><Text weight="medium">{props.primary}</Text>
          {props.badge && <span className={styles.badge}>{props.badge}</span>}</span>
        <Text type="supporting" color="secondary">{props.secondary}</Text>
      </div>
      {props.price && <Text weight="medium" hasTabularNumbers>{props.price}</Text>}
      {props.deltaPercent !== undefined && <TrendDelta value={props.deltaPercent} />}
      {props.children && <div className={styles.chart}>{props.children}</div>}
    </div>
  </ClickableCard></div>;
  return props.href.startsWith('#explore/')
    ? <Tooltip content={PROTOTYPE_NOTICE} placement="above" hasHoverIndication={false}>{card}</Tooltip>
    : card;
}
