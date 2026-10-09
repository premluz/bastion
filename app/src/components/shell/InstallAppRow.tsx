import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { Item } from '@astryxdesign/core/Item';
import { Text } from '@astryxdesign/core/Text';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { INSTALL_COPY } from '../../engine/installApp';
import { useInstallApp } from '../../engine/useInstallApp';
import styles from './AccountPages.module.css';

// Settings → Install app (2026-10-09, direct feedback: a CTA the user can
// click to install). Where the browser allows it the button installs in one
// tap; elsewhere the row says how, since iOS offers pages no install API.
export function InstallAppRow() {
  const { kind, install } = useInstallApp();
  const [error, setError] = useState('');
  const copy = INSTALL_COPY[kind];
  const run = () => {
    setError('');
    install().catch((cause: unknown) => {
      console.error('Installing the app failed', cause);
      setError(`Couldn’t install: ${cause instanceof Error ? cause.message : String(cause)}`);
    });
  };
  return <>
    <Item className={styles.row} label="Install app" description={copy.description} labelLines={1} descriptionLines={3}
      startContent={<Icon icon={ArrowDownTrayIcon} />}
      {...(copy.action ? { endContent: <Button label={copy.action} variant="primary" size="sm" onClick={run} /> } : {})} />
    {error && <Text role="alert" color="secondary">{error}</Text>}
  </>;
}
