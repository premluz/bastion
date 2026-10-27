import { Button } from '@astryxdesign/core/Button';
import { PROTOTYPE_NOTICE, notifyPrototypeUnavailable } from './PrototypeNotice';
import styles from './WalletCardTile.module.css';

export interface WalletCardTileProps { onManage?: () => void }

// The Manage button for whichever card is in front, laid over the deck's own
// container (2026-10-12, direct feedback: the name/cashback row under the cards
// is gone, and Manage floats over the cards instead of pushing content down).
// CardDeck renders this beside the cards, so it stays still while they move.
export function WalletCardTile({ onManage }: WalletCardTileProps) {
  return onManage
    ? <Button label="Manage cards" variant="secondary" size="sm" className={styles.manageButton} onClick={onManage} data-manage-cards />
    : <Button label="Manage cards" tooltip={PROTOTYPE_NOTICE} variant="secondary" size="sm"
      className={styles.manageButton} onClick={notifyPrototypeUnavailable} data-manage-cards />;
}
