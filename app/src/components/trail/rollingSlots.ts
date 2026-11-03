export type RollKind = 'still' | 'roll' | 'enter' | 'leave';
export interface RollSlot { kind: RollKind; char: string; from: string; order: number }

/** Pairs two strings from their right ends, as figures line up by their last digit: a character that stays is still, one that
 *  differs rolls, one only in the new text enters, one only in the old leaves. `order` counts the changed slots from the right,
 *  so the last digit moves first and unchanged digits never count. */
export function rollSlots(from: string, to: string): RollSlot[] {
  const before = Array.from(from);
  const after = Array.from(to);
  const length = Math.max(before.length, after.length);
  const slots: RollSlot[] = [];
  let order = 0;
  for (let index = length - 1; index >= 0; index -= 1) {
    const prev = before[index - (length - before.length)] ?? '';
    const next = after[index - (length - after.length)] ?? '';
    const kind: RollKind = prev === next ? 'still' : prev === '' ? 'enter' : next === '' ? 'leave' : 'roll';
    slots.unshift({ kind, char: next, from: prev, order: kind === 'still' ? 0 : order });
    if (kind !== 'still') order += 1;
  }
  return slots;
}

/** How many CSS animations a change runs: a roll moves its old and new character, an entering or leaving slot itself. */
export const rollAnimationCount = (slots: readonly RollSlot[]) =>
  slots.reduce((count, slot) => count + (slot.kind === 'roll' ? 2 : slot.kind === 'still' ? 0 : 1), 0);
