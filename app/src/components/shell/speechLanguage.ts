// The assistant's scenarios, recorded clips and trigger phrases are English,
// so listening and speaking are English whatever the device is set to
// (2026-10-09, direct feedback: spoken triggers were not recognised — an
// engine set to the phone's own language transcribes English speech as that
// language). An English device locale (en-GB, en-AU…) is kept for its accent.
export function speechLanguage(deviceLanguage: string | undefined): string {
  return deviceLanguage && /^en([-_]|$)/i.test(deviceLanguage) ? deviceLanguage.replace('_', '-') : 'en-US';
}
