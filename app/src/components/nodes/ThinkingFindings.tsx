import { SparklesIcon } from '@heroicons/react/24/outline';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import type { ThinkingFindingsProps } from '../../contracts/props/thinking-findings';
import shimmer from '../trail/ThinkingTrail.module.css';
import styles from './ThinkingFindings.module.css';

export function ThinkingFindings({ label, steps, activeIndex, isComplete }: ThinkingFindingsProps) {
  const visible = isComplete ? steps : steps.slice(0, activeIndex + 1);
  const seconds = steps.reduce((total, step) => total + step.durationMs, 0) / 1000;
  return <section aria-label={label} data-thinking-complete={isComplete}>
    <Collapsible key={isComplete ? 'settled' : 'active'} defaultIsOpen={!isComplete}
      trigger={<span className={styles.trigger}><Icon icon={SparklesIcon} size="sm" />
        <Text color="secondary" className={isComplete ? '' : shimmer.shimmerText}>
          {isComplete ? `Thought for ${seconds.toFixed(1)} seconds` : label}</Text></span>}>
      <ol className={styles.rail} aria-live={isComplete ? 'off' : 'polite'}>
        {visible.map((step, index) => {
          const active = !isComplete && index === activeIndex;
          return <li key={step.id} className={styles.row} data-finding-state={active ? 'working' : 'resolved'}>
            <Icon icon={active ? 'wrench' : 'check'} size="sm" color="secondary" />
            <Text color="secondary" className={active ? shimmer.shimmerText : ''}>{active ? step.label : step.detail ?? step.label}</Text>
          </li>;
        })}
      </ol>
    </Collapsible>
  </section>;
}
