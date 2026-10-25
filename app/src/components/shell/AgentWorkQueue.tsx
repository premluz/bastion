import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Icon } from '@astryxdesign/core/Icon';
import { Spinner } from '@astryxdesign/core/Spinner';
import { Text } from '@astryxdesign/core/Text';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import type { AgentTask } from '../../engine/attentionQueue';
import styles from './AgentWorkQueue.module.css';

export interface AgentWorkQueueProps {
  tasks: AgentTask[];
  /** `card`: a full-width card in the page. `status` (2026-10-23, direct feedback): the agent's
      status line — small and subtle, smaller than the navigation, floating above the orb. */
  variant?: 'card' | 'status';
}

function TaskMark({ status, compact }: { status: AgentTask['status']; compact: boolean }) {
  return status === 'needs-input'
    ? <span className={styles.alert}><Icon icon={ExclamationCircleIcon} size="sm" /></span>
    : <span className={styles.spinner}><Spinner size={compact ? 'md' : 'lg'} shade="inherit" aria-label="Working" /></span>;
}

// The assistant's work in progress (2026-10-23, direct feedback with a mock): one line at
// rest — what needs the user first, else how many tasks are running — expanding to every
// task and its state.
export function AgentWorkQueue({ tasks, variant = 'card' }: AgentWorkQueueProps) {
  if (tasks.length === 0) return null;
  const compact = variant === 'status';
  const line = compact ? 'supporting' : 'body';
  const waiting = tasks.find((task) => task.status === 'needs-input');
  const summary = waiting
    ? <><TaskMark status="needs-input" compact={compact} />
      <span className={styles.summaryText}>
        <Text type={line}>{waiting.label}</Text>
        <Text type="supporting" className={styles.actionText}>Action required · Tap to review</Text>
      </span></>
    : <><TaskMark status="working" compact={compact} />
      <Text type={line} className={styles.summaryText}>Working on {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</Text></>;
  return (
    <section className={styles.root} aria-label="Assistant activity" data-variant={variant} data-needs-input={waiting ? '' : undefined}>
      <Collapsible trigger={<span className={styles.summary}>{summary}</span>} defaultIsOpen={false}>
        <ul className={styles.list}>
          {tasks.map((task) => <li key={task.id} className={styles.row}>
            <TaskMark status={task.status} compact={compact} />
            <span className={styles.summaryText}>
              <Text type={line}>{task.label}</Text>
              <Text type="supporting" color="secondary">{task.status === 'needs-input' ? 'Waiting for you' : 'In progress'}</Text>
            </span>
          </li>)}
        </ul>
      </Collapsible>
    </section>
  );
}
