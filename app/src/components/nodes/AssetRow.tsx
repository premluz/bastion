import { Item } from '@astryxdesign/core/Item';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { CoinLogo } from './CoinLogo';
import { TrendDelta } from './TrendDelta';
import type { AssetRowProps } from '../../contracts/props/asset-row';
import { PROTOTYPE_NOTICE } from '../shell/PrototypeNotice';
import styles from './ExploreComponents.module.css';

export function AssetRow(props: AssetRowProps) {
  const owned = props.variant === 'owned';
  const metadata = [props.marketCap && `${props.marketCap} cap`, props.volume && `${props.volume} vol`].filter(Boolean).join(' · ');
  const item = <Item density="balanced" href={props.href} data-asset-id={props.entityId} data-explore-link={props.href}
    isSelected={props.selected} className={styles.row}
    startContent={<CoinLogo entityId={props.entityId} label={props.symbol} />}
    label={<span className={styles.identity}>
      <span className={styles.name}><Text weight="medium">{owned ? props.symbol : props.name}</Text>
        {props.badge && <span className={styles.badge}>{props.badge}</span>}</span>
      {owned ? <TrendDelta value={props.deltaPercent} /> : <Text type="supporting" color="secondary">{metadata}</Text>}
    </span>}
    endContent={<span className={styles.values}><Text weight="medium" hasTabularNumbers>{props.value}</Text>
      {owned ? <Text type="supporting" color="secondary">{props.quantity} {props.symbol}</Text> : <TrendDelta value={props.deltaPercent} />}
    </span>} />;
  return props.href.startsWith('#explore/')
    ? <Tooltip content={PROTOTYPE_NOTICE} placement="above" hasHoverIndication={false}>{item}</Tooltip>
    : item;
}
