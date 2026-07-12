import { useMemo, useState } from 'react';
import { ChatComposer, ChatComposerInput } from '@astryxdesign/core/Chat';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { submitQuery } from '../../engine/submitQuery';

// The composer only — docked at the bottom of Frame's flex column (Frame.tsx).
// The running query log lives in Frame's scrollable content area, not here.
//
// Structure adopted verbatim from Astryx's ai-chat template
// (.astryx-scratch/ai-chat/page.tsx lines 311-357): value/onChange
// controlled at the ChatComposer level, input={<ChatComposerInput />} in
// place of the bare default textarea (multi-row growth, arrow-key history
// recall). Copy adapted only, per the work order. The template's
// headerActions (Mention/Attach) and footerActions (Ask/Edit mode toggle)
// are omitted — they have no corresponding Merlin behavior, and shipping
// them as inert buttons would be dead UI.
export function ChatBar() {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resolver = useMemo(() => createKeywordResolver(), []);

  const handleSubmit = async (submittedValue: string) => {
    if (!submittedValue.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await submitQuery(submittedValue, resolver);
    setValue('');
    setIsSubmitting(false);
  };

  return (
    <ChatComposer
      value={value}
      onChange={setValue}
      onSubmit={handleSubmit}
      isDisabled={isSubmitting}
      placeholder="Ask a question about the venue…"
      input={<ChatComposerInput />}
    />
  );
}
