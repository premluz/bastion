import type { ReactNode, Ref } from 'react';
import { ChatComposer, ChatComposerInput, type ChatComposerInputHandle } from '@astryxdesign/core/Chat';

export interface ChatBarComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  isDisabled?: boolean;
  sendActions?: ReactNode;
  /** Replaces the composer's own send button (e.g. a voice action while the field is empty). */
  sendButton?: ReactNode;
  footerActions?: ReactNode;
  inputRef?: Ref<ChatComposerInputHandle>;
}

// The single composer implementation shared by the connected shell and previews.
export function ChatBarComposer({ inputRef, ...props }: ChatBarComposerProps) {
  const input = inputRef
    ? <ChatComposerInput handleRef={inputRef} />
    : <ChatComposerInput />;
  return <ChatComposer {...props} input={input} />;
}
