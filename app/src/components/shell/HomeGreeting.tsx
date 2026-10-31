import { Text } from '@astryxdesign/core/Text';
import { greetingFor, USER_FIRST_NAME } from './greeting';
import styles from './HomeGreeting.module.css';

const DATE_LINE = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

// The calm home's day and greeting (2026-10-31, direct feedback: smaller, and in the header at the avatar's level): the
// header's own start side, beside the avatar, so it stays put while the page scrolls under it.
export function HomeGreeting() {
  const now = new Date();
  return (
    <div className={styles.root}>
      <Text type="supporting" color="secondary" className={styles.date}>{DATE_LINE.format(now)}</Text>
      <Text as="h1" className={styles.hello}>{greetingFor(now.getHours())}, {USER_FIRST_NAME}</Text>
    </div>
  );
}
