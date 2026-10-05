import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { TextInput } from '@astryxdesign/core/TextInput';
import { AccountExperience } from './AccountExperience';
import { AssistantOrb } from './AssistantOrb';
import { BuyEthTranscript } from './BuyEthTranscript';
import '../../theme/purchase.css';
import frame from './MobileFrame.module.css';
import styles from './BuyEthConversation.module.css';

export function BuyEthConversation({ query, amount, onClose }: { query: string; amount: number; onClose: () => void }) {
  return <div className={frame.stage}><div className={frame.phone} data-testid="buy-eth-shell">
    <AccountExperience>{(openAccounts) => <div className={styles.layout}>
      <header className={frame.header} aria-label="Asset search">
        <Button label="Open account menu" variant="ghost" icon={<Avatar name="Prem" size="small" />} isIconOnly onClick={openAccounts} />
        <TextInput label="Search assets" isLabelHidden startIcon="search" value="" placeholder="Search assets" isDisabled />
      </header>
      <main className={styles.scroll} aria-label="Purchase flow"><BuyEthTranscript query={query} amount={amount} /></main>
      <footer className={styles.footer}>
        <span className={styles.spacer} />
        <Button label="Return to composer" variant="ghost" onClick={onClose}><AssistantOrb activity="thinking" expanded /></Button>
        <IconButton label="Close purchase flow" icon={<Icon icon="close" />} variant="ghost" onClick={onClose} />
      </footer>
    </div>}</AccountExperience>
  </div></div>;
}
