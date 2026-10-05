import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from '@astryxdesign/core/Text';
import { ApprovalCard } from './ApprovalCard';
import { ApprovalCardPropsSchema, type ApprovalCardProps } from '../../contracts/props/approval-card';
import styles from './ApprovalCard.module.css';

const questions = [
  { prompt: 'How many flavors should we launch?', options: [
    { value: 'three', label: 'Three (core line)' }, { value: 'five', label: 'Five (full case)' }, { value: 'one', label: 'Just one hero' },
  ] },
  { prompt: 'Which launch channel should we use?', options: [
    { value: 'online', label: 'Online store' }, { value: 'retail', label: 'Retail partners' }, { value: 'both', label: 'Both channels' },
  ] },
  { prompt: 'When should we launch?', options: [
    { value: 'month', label: 'Next month' }, { value: 'quarter', label: 'Next quarter' }, { value: 'ready', label: 'When we are ready' },
  ] },
];

function Interactive(args: ApprovalCardProps) {
  const [index, setIndex] = useState(args.questionIndex);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [other, setOther] = useState<Record<number, string>>({});
  const [result, setResult] = useState('');
  useEffect(() => { setIndex(args.questionIndex); setResult(''); }, [args.questionIndex, args.questionCount]);
  const question = args.questionCount > 1 ? questions[index % questions.length] : undefined;
  const props = ApprovalCardPropsSchema.parse({ ...args, ...question, questionIndex: index,
    selected: answers[index] ?? args.selected, otherValue: other[index] ?? args.otherValue });
  const advance = () => index < args.questionCount - 1 ? setIndex(index + 1) : setResult('Answers submitted.');
  return <div className={styles.preview} onChange={(event) => {
    if (!(event.target instanceof Element)) return;
    const card = event.target.closest('[data-approval-card]');
    if (event.target.closest('[data-approval-other]')) {
      setOther((values) => ({ ...values, [index]: card?.getAttribute('data-approval-other-value') ?? '' }));
      setAnswers((values) => ({ ...values, [index]: '' }));
    } else {
      setAnswers((values) => ({ ...values, [index]: card?.getAttribute('data-approval-value') ?? '' }));
      setOther((values) => ({ ...values, [index]: '' }));
    }
  }} onClick={(event) => {
    if (!(event.target instanceof Element)) return;
    const action = event.target.closest('[data-approval-action]')?.getAttribute('data-approval-action');
    if (action === 'previous') setIndex(Math.max(0, index - 1));
    if (action === 'next') setIndex(Math.min(args.questionCount - 1, index + 1));
    if (action === 'continue' || action === 'skip') advance();
    if (action === 'dismiss') setResult('Question dismissed.');
  }}>
    {result ? <Text role="status">{result}</Text> : <ApprovalCard key={index} {...props} />}
  </div>;
}

const meta: Meta<typeof ApprovalCard> = {
  title: 'Nodes/ApprovalCard', component: ApprovalCard, render: (args) => <Interactive {...args} />,
  args: ApprovalCardPropsSchema.parse({ questionId: 'funding', prompt: 'Got it. Which would you like to fund it with?', options: [
    { value: 'USDC', label: 'USDC', description: 'Your balance is 812.22 USDC' },
    { value: 'USDT', label: 'USDT', description: 'Your balance is 912.76 USDT' },
  ] }),
  argTypes: { questionCount: { control: { type: 'number', min: 1, max: 3 } },
    questionIndex: { control: { type: 'number', min: 0, max: 2 } } },
};
export default meta;
type Story = StoryObj<typeof ApprovalCard>;
export const SingleQuestion: Story = {};
export const Selected: Story = { args: { selected: 'USDT' } };
export const MultipleQuestions: Story = { args: { questionCount: 3, allowOther: true, isDismissible: true } };
export const MultipleWithoutExtras: Story = { args: { questionCount: 3, allowSkip: false } };
export const ContinueOnly: Story = { args: { questionCount: 2, questionIndex: 1, navigationMode: 'continue-only', allowSkip: false } };
export const Numbered: Story = { args: { questionCount: 2, navigationMode: 'numbered', allowSkip: false } };
export const HiddenNavigation: Story = { args: { questionCount: 2, navigationMode: 'hidden', allowSkip: false } };
