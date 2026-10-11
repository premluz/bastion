// The assistant's salutation (shared by the agent home's heading, 2026-10-10).
export const USER_FIRST_NAME = 'Prem';

export function greetingFor(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
