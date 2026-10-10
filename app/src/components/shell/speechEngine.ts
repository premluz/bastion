import { NativeRecognition, hasNativeVoice } from './nativeVoice';

// The shape of a speech recogniser the voice hook drives: the browser's
// SpeechRecognition, or the iOS app's native one (nativeVoice.ts), which
// mimics it so the hook has one code path (2026-10-09).
export interface RecognitionResultLike {
  readonly isFinal: boolean;
  readonly [index: number]: { readonly transcript: string } | undefined;
}
export interface RecognitionResultEvent { readonly results: ArrayLike<RecognitionResultLike> }
export interface RecognitionErrorEvent { readonly error: string }

export interface RecognitionEngine {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type RecognitionConstructor = new () => RecognitionEngine;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

/** Native in the iOS app — the web view's own engine is unreliable there — else the browser's. */
export function resolveRecognition(): RecognitionConstructor | undefined {
  if (hasNativeVoice()) return NativeRecognition;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export function recognitionError(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed': return 'Microphone permission was denied.';
    case 'audio-capture': return 'No microphone is available.';
    case 'network': return 'Speech recognition lost its network connection.';
    case 'language-not-supported': return 'Speech recognition does not support this language.';
    default: return `Speech recognition stopped: ${code}.`;
  }
}
