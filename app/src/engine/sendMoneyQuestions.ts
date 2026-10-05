import optionsJson from '../../scenes/send-paul-options.scene.json';
import { HydratedSceneSchema } from '../contracts/scene';
import { ApprovalCardPropsSchema } from '../contracts/props/approval-card';
import { SEND_DEMO, stableTotal, type SendState, type SendAction } from './sendMoneyState';

const scene = HydratedSceneSchema.parse(optionsJson);
export const recipientQuestion = ApprovalCardPropsSchema.parse(scene.layout.children?.find((node) => node.id === 'send-recipient')?.props);
export const fundingQuestion = ApprovalCardPropsSchema.parse(scene.layout.children?.find((node) => node.id === 'send-options')?.props);
export function recipientName(state: SendState): string {
  return recipientQuestion.options.find((option) => option.value === state.recipient)?.label ?? 'Daniel';
}
export const needsFunding = (state: SendState) => state.amountCents + SEND_DEMO.feeCents > SEND_DEMO.mainCents;
const OTHER_FUNDING_PROMPT = 'Tell me what you’d like to use in the composer.';
export function applyQuestionAction(state: SendState, action: SendAction, now: number, duration: number): SendState {
  if (action.type === 'recipient' && recipientQuestion.options.some((option) => option.value === action.value))
    return action.advance ? applyQuestionAction({ ...state, recipient: action.value, error: '' }, { type: 'continue' }, now, duration)
      : { ...state, recipient: action.value, error: '' };
  if (action.type === 'choose') {
    if (action.funding === 'consolidate' && state.amountCents + SEND_DEMO.feeCents > stableTotal) return state;
    const selected = { ...state, funding: action.funding, error: action.funding === 'other' ? OTHER_FUNDING_PROMPT : '' };
    return action.advance ? applyQuestionAction(selected, { type: 'continue' }, now, duration) : selected;
  }
  if (action.type === 'previous') return { ...state, questionIndex: 0, error: '' };
  if (action.type === 'next' || action.type === 'skip')
    return { ...state, questionIndex: needsFunding(state) && state.questionIndex === 0 ? 1 : 0, error: '' };
  if (action.type !== 'continue') return state;
  if (!state.recipient) return { ...state, questionIndex: 0, error: 'Choose which Daniel you mean before continuing.' };
  if (state.questionIndex === 0 && needsFunding(state)) return { ...state, questionIndex: 1, error: '' };
  if (needsFunding(state) && !state.funding) return { ...state, questionIndex: 1, error: 'Choose where the funds should come from before continuing.' };
  if (state.funding === 'other') return { ...state, questionIndex: 1, error: OTHER_FUNDING_PROMPT };
  return { ...state, preparationStarted: !state.funding || state.funding === 'consolidate', stage: !state.funding || state.funding === 'consolidate' ? 'moving' : 'funding',
    step: 0, dueAt: now + duration, error: '' };
}
