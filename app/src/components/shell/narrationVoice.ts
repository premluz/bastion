// The synthetic voice for lines without a recorded clip (2026-10-09, direct
// feedback: "change to more similar"). The recorded assistant is a male
// speaker (median pitch 103–130 Hz across the send clips, measured), so
// prefer the male English voice each platform ships, in this order. Web
// pages can only use voices already installed, so a device with none of
// these keeps its default voice — by design, not an error.
const PREFERRED = [
  // iOS / macOS system voices
  'Aaron', 'Nathan', 'Evan', 'Tom', 'Alex', 'Daniel', 'Arthur',
  // Edge (Azure neural) voices
  'Microsoft Andrew', 'Microsoft Guy', 'Microsoft Christopher', 'Microsoft Davis', 'Microsoft Ryan',
  // Chrome desktop network voice
  'Google UK English Male',
  // Android Google speech engine male voices (matched on voiceURI/name)
  'en-us-x-iom', 'en-us-x-iol', 'en-us-x-tpd', 'en-gb-x-rjs', 'en-gb-x-gbd',
] as const;

export interface VoiceLike { name: string; lang: string; voiceURI: string }

export function pickNarrationVoice<V extends VoiceLike>(voices: readonly V[], language: string): V | null {
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'));
  const region = language.toLowerCase().replace('_', '-');
  for (const preferred of PREFERRED) {
    const wanted = preferred.toLowerCase();
    // Android voices are named by locale only; their engine code is in voiceURI.
    const matches = english.filter((voice) => wanted.startsWith('en-') ? voice.voiceURI.toLowerCase().includes(wanted)
      : voice.name.toLowerCase() === wanted || voice.name.toLowerCase().startsWith(`${wanted} `));
    if (!matches.length) continue;
    return matches.find((voice) => voice.lang.toLowerCase().replace('_', '-') === region) ?? matches[0]!;
  }
  return null;
}
