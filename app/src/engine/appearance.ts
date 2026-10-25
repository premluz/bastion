// Dark / light appearance (2026-10-14, direct feedback: a Settings switch, also
// controlled from the URL so the portfolio page that embeds the app in a frame can
// switch it). Pure parts: which theme file each appearance is, and where a request
// can come from. The store (stores/appearanceStore.ts) applies it.
export type Appearance = 'dark' | 'light';

export const APPEARANCES: readonly Appearance[] = ['dark', 'light'];
export const THEME_FOR_APPEARANCE: Record<Appearance, string> = { dark: 'bastion', light: 'bastion-light' };

/** The query parameter: `?theme=light` or `?theme=dark`. */
export const APPEARANCE_QUERY_PARAM = 'theme';

/** The message a host page posts into the frame: `{ type: 'bastion:appearance', appearance: 'light' }`. */
export const APPEARANCE_MESSAGE_TYPE = 'bastion:appearance';

export function isAppearance(value: unknown): value is Appearance {
  return typeof value === 'string' && (APPEARANCES as readonly string[]).includes(value);
}

/** The appearance a URL query string asks for, if any (anything else is ignored). */
export function appearanceFromSearch(search: string): Appearance | null {
  const value = new URLSearchParams(search).get(APPEARANCE_QUERY_PARAM);
  return isAppearance(value) ? value : null;
}

/** The appearance a posted message asks for, if it is one of ours. */
export function appearanceFromMessage(data: unknown): Appearance | null {
  if (typeof data !== 'object' || data === null) return null;
  const message = data as { type?: unknown; appearance?: unknown };
  return message.type === APPEARANCE_MESSAGE_TYPE && isAppearance(message.appearance) ? message.appearance : null;
}
