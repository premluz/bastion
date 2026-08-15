import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { List, ListItem } from '@astryxdesign/core/List';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import styles from './ConnectWalletDialog.module.css';

export interface WalletEntry {
  id: string;
  name: string;
  type: string;
}

interface ConnectWalletDialogProps {
  wallet: WalletEntry | null;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (id: string) => void;
}

const WALLET_PERMISSIONS = ['Read balances and holdings', 'Read transaction history'];

// Same shape as ConnectSourceDialog.tsx (Phase 8H WO-2), reused verbatim
// per Phase 15's own order: one dialog, "select" is the wallet row click
// that opens it already scoped to one entry, this is the permissions-
// summary step, confirm is its footer action. purpose="form" so an
// accidental backdrop click doesn't discard the in-progress flow.
export function ConnectWalletDialog({ wallet, onOpenChange, onConfirm }: ConnectWalletDialogProps) {
  return (
    <Dialog isOpen={wallet !== null} onOpenChange={onOpenChange} purpose="form" width={440}>
      {wallet && (
        <>
          <DialogHeader title={`Connect ${wallet.name}`} subtitle="Permissions summary" onOpenChange={onOpenChange} />
          <div className={styles.body}>
            <Text type="supporting">{wallet.type}</Text>
            <List hasDividers density="compact">
              {WALLET_PERMISSIONS.map((permission) => (
                <ListItem key={permission} label={permission} />
              ))}
            </List>
            <Text type="supporting" color="secondary">
              Preview only — this demo doesn't reach a real wallet; confirming previews what the
              connect flow would feel like, session-scoped, nothing persists after a reset.
            </Text>
            <div className={styles.footerRow}>
              <Button label="Cancel" variant="ghost" onClick={() => onOpenChange(false)} />
              <Button
                label="Confirm connection"
                variant="primary"
                onClick={() => {
                  onConfirm(wallet.id);
                  onOpenChange(false);
                }}
              />
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
