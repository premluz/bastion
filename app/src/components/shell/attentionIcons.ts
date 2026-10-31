import { ArrowTrendingUpIcon, ExclamationCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import type { AttentionKind } from '../../engine/attentionQueue';

/** Each kind of attention item's mark: the home's card and the scenario pane it expands into draw the same one. */
export const ATTENTION_ICON: Record<AttentionKind, typeof UserIcon> = { due: ExclamationCircleIcon, request: UserIcon, review: ArrowTrendingUpIcon };
