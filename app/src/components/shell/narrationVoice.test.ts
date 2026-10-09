import { describe, expect, it } from 'vitest';
import { pickNarrationVoice } from './narrationVoice';

const voice = (name: string, lang: string, voiceURI = name) => ({ name, lang, voiceURI });

describe('pickNarrationVoice', () => {
  it('prefers the first listed male English voice the device has', () => {
    const voices = [voice('Samantha', 'en-US'), voice('Daniel', 'en-GB'), voice('Aaron', 'en-US'), voice('Thomas', 'fr-FR')];
    expect(pickNarrationVoice(voices, 'en-US')?.name).toBe('Aaron');
  });

  it('matches Chrome, Edge and Android voices by their own naming', () => {
    expect(pickNarrationVoice([voice('Google US English', 'en-US'), voice('Google UK English Male', 'en-GB')], 'en-US')?.name).toBe('Google UK English Male');
    expect(pickNarrationVoice([voice('Microsoft Andrew Online (Natural) - English (United States)', 'en-US')], 'en-US')?.name).toMatch(/Andrew/);
    expect(pickNarrationVoice([voice('English United States', 'en-US', 'en-us-x-sfg-local'), voice('English United States', 'en-US', 'en-us-x-iom-network')], 'en-US')?.voiceURI)
      .toBe('en-us-x-iom-network');
  });

  it('prefers the user’s own region when a voice exists in several', () => {
    expect(pickNarrationVoice([voice('Daniel', 'en-GB'), voice('Daniel', 'en-US')], 'en-US')?.lang).toBe('en-US');
  });

  it('keeps the device default when none is installed, and ignores non-English look-alikes', () => {
    expect(pickNarrationVoice([voice('Samantha', 'en-US')], 'en-US')).toBeNull();
    expect(pickNarrationVoice([voice('Daniel', 'de-DE')], 'en-US')).toBeNull();
    expect(pickNarrationVoice([voice('Alexandra', 'en-US')], 'en-US')).toBeNull();
  });
});
