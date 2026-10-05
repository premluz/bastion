import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Item } from '@astryxdesign/core/Item';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { PlusIcon, CpuChipIcon, KeyIcon, EyeIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { ACCOUNT_METHODS, type AccountMethod } from './accountTypes';
import styles from './AccountPages.module.css';

const methods = ['create', 'hardware', 'phrase', 'key', 'watch'] as const;
const icons = { create: PlusIcon, hardware: CpuChipIcon, phrase: Squares2X2Icon, key: KeyIcon, watch: EyeIcon };

export function AccountAddPage({ method, isSetup, onMethod, onCreate }: {
  method: AccountMethod; isSetup: boolean; onMethod: (method: AccountMethod) => void; onCreate: (name: string) => void;
}) {
  const [name, setName] = useState('');
  return <div className={isSetup ? styles.body : styles.options}>
    {isSetup ? <>
      <Text type="large">{ACCOUNT_METHODS[method].title}</Text>
      <Text color="secondary">Try this flow with a demo account. No wallet connection or secret keys are needed.</Text>
      <TextInput label="Account name" value={name} onChange={(value) => setName(value.slice(0, 40))} placeholder="My account" />
      <Button label="Add demo account" isDisabled={!name.trim()} onClick={() => onCreate(name.trim())} />
    </> : methods.map((key) => <Item key={key} className={styles.row} label={ACCOUNT_METHODS[key].title}
      description={ACCOUNT_METHODS[key].description} startContent={<Icon icon={icons[key]} />}
      endContent={<Icon icon="chevronRight" />} onClick={() => onMethod(key)} />)}
  </div>;
}
