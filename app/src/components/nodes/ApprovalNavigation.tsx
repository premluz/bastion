import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import type { ApprovalCardProps } from '../../contracts/props/approval-card';
import styles from './ApprovalCard.module.css';

// Presentational control group; actions are handled by the hosting shell.
export function ApprovalNavigation({ questionIndex, questionCount, allowSkip, selected, otherValue, isDisabled, navigationMode }: ApprovalCardProps) {
  if (navigationMode === 'continue-only') return <footer className={styles.footer}>
    <div className={styles.actions}>
      <Button label="Continue" variant="primary" className={styles.continueButton} data-approval-action="continue"
        isDisabled={isDisabled || questionIndex === 0 || (!selected && !otherValue.trim())} />
    </div>
  </footer>;
  return <footer className={styles.footer}>
    <div className={styles.pagination}>
      <IconButton label="Previous question" icon={<Icon icon="chevronLeft" />} variant="ghost"
        data-approval-action="previous" isDisabled={isDisabled || questionIndex === 0} />
      <Text type="supporting" color="secondary">{navigationMode === 'numbered' ? `${questionIndex + 1} of ${questionCount}` : `${questionIndex + 1}/${questionCount}`}</Text>
      <IconButton label="Next question" icon={<Icon icon="chevronRight" />} variant="ghost"
        data-approval-action="next" isDisabled={isDisabled || questionIndex === questionCount - 1} />
    </div>
    <div className={styles.actions}>
      {allowSkip && <Button label="Skip" variant="secondary" data-approval-action="skip" isDisabled={isDisabled} />}
      {navigationMode === 'numbered'
        ? <Button label="Continue" variant="primary" className={styles.continueButton} data-approval-action="continue"
          isDisabled={isDisabled || (!selected && !otherValue.trim())} />
        : <Button label="Continue" data-approval-action="continue" isDisabled={isDisabled || (!selected && !otherValue.trim())} />}
    </div>
  </footer>;
}
