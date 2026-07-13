import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { List, ListItem } from '@astryxdesign/core/List';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';

export interface CatalogEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  permissions: string[];
}

interface ConnectSourceDialogProps {
  entry: CatalogEntry | null;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (id: string) => void;
}

// One dialog, steps within it rather than nested dialogs (Dialog's own
// "Don't nest dialogs" guidance) — "select" is the catalog row click that
// opens it already scoped to one entry; this is the permissions-summary
// step, confirm is its footer action. purpose="form" so an accidental
// backdrop click doesn't discard the in-progress flow.
export function ConnectSourceDialog({ entry, onOpenChange, onConfirm }: ConnectSourceDialogProps) {
  return (
    <Dialog isOpen={entry !== null} onOpenChange={onOpenChange} purpose="form" width={440}>
      {entry && (
        <>
          <DialogHeader title={`Connect ${entry.name}`} subtitle="Permissions summary" onOpenChange={onOpenChange} />
          <div style={{ padding: 'var(--space-16)', display: 'grid', gap: 'var(--space-12)' }}>
            <Text type="supporting">{entry.description}</Text>
            <List hasDividers density="compact">
              {entry.permissions.map((permission) => (
                <ListItem key={permission} label={permission} />
              ))}
            </List>
            <Text type="supporting" color="secondary">
              Preview only — this demo doesn't reach a real integration; confirming previews what the
              connect flow would feel like, session-scoped, nothing persists after a reset.
            </Text>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
              <Button label="Cancel" variant="ghost" onClick={() => onOpenChange(false)} />
              <Button
                label="Confirm connection"
                variant="primary"
                onClick={() => {
                  onConfirm(entry.id);
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
