import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import type { RecognitionEngine, RecognitionErrorEvent, RecognitionResultEvent } from './speechEngine';

// Bridge to the iOS app's NativeVoicePlugin (app/ios/App/App): Apple's speech
// recognition and voices, used instead of the web view's (2026-10-09).
interface NativeVoicePlugin {
  startListening(options: { lang: string; session: string }): Promise<void>;
  stopListening(): Promise<void>;
  abortListening(): Promise<void>;
  speak(options: { text: string; id: string; lang: string }): Promise<void>;
  stopSpeaking(): Promise<void>;
  addListener(event: 'result', listener: (data: { session: string; text: string; isFinal: boolean }) => void): Promise<PluginListenerHandle>;
  addListener(event: 'end', listener: (data: { session: string }) => void): Promise<PluginListenerHandle>;
  addListener(event: 'error', listener: (data: { session: string; code: string; message: string }) => void): Promise<PluginListenerHandle>;
  addListener(event: 'speechStart' | 'speechEnd', listener: (data: { id: string }) => void): Promise<PluginListenerHandle>;
}

const NativeVoice = registerPlugin<NativeVoicePlugin>('NativeVoice');

export const hasNativeVoice = () => Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('NativeVoice');

let nextId = 0;
const newId = (prefix: string) => `${prefix}-${++nextId}`;
const errorCode = (cause: unknown) =>
  cause instanceof Error && 'code' in cause && typeof cause.code === 'string' ? cause.code : 'audio-capture';
const removeAll = (handles: Promise<PluginListenerHandle>[]) =>
  handles.forEach((handle) => { void handle.then((listener) => listener.remove()); });

/** A SpeechRecognition look-alike over the native recogniser; one phrase per start(). */
export class NativeRecognition implements RecognitionEngine {
  continuous = true;
  interimResults = true;
  lang = 'en-US';
  onresult: ((event: RecognitionResultEvent) => void) | null = null;
  onerror: ((event: RecognitionErrorEvent) => void) | null = null;
  onend: (() => void) | null = null;
  private readonly session = newId('listen');
  private handles: Promise<PluginListenerHandle>[] = [];
  private ended = false;

  start() {
    const mine = (data: { session: string }) => data.session === this.session;
    this.handles = [
      NativeVoice.addListener('result', (data) => {
        if (mine(data)) this.onresult?.({ results: [{ isFinal: data.isFinal, 0: { transcript: data.text } }] });
      }),
      NativeVoice.addListener('error', (data) => { if (mine(data)) this.onerror?.({ error: data.code }); }),
      NativeVoice.addListener('end', (data) => { if (mine(data)) this.finish(); }),
    ];
    NativeVoice.startListening({ lang: this.lang, session: this.session }).catch((cause: unknown) => {
      console.error('Native speech recognition failed to start', cause);
      this.onerror?.({ error: errorCode(cause) });
      this.finish();
    });
  }

  stop() {
    NativeVoice.stopListening().catch((cause: unknown) => console.error('Native speech recognition failed to stop', cause));
  }

  abort() {
    NativeVoice.abortListening().catch((cause: unknown) => console.error('Native speech recognition failed to abort', cause));
  }

  private finish() {
    if (this.ended) return;
    this.ended = true;
    removeAll(this.handles);
    this.onend?.();
  }
}

const START_TIMEOUT_MS = 4000;

/** Speaks with Apple's voices; the returned function cancels without callbacks. */
export function speakNatively(text: string, lang: string, callbacks: { onStart: () => void; onEnd: () => void; onError: (cause: Error) => void }) {
  const id = newId('speak');
  let settled = false;
  const handles = [
    NativeVoice.addListener('speechStart', (data) => {
      if (data.id !== id || settled) return;
      clearTimeout(startTimer);
      callbacks.onStart();
    }),
    NativeVoice.addListener('speechEnd', (data) => {
      if (data.id !== id || settled) return;
      settle();
      callbacks.onEnd();
    }),
  ];
  const settle = () => { settled = true; clearTimeout(startTimer); removeAll(handles); };
  const startTimer = setTimeout(() => {
    if (settled) return;
    settle();
    callbacks.onError(new Error(`Native speech did not start within ${START_TIMEOUT_MS} ms.`));
  }, START_TIMEOUT_MS);
  NativeVoice.speak({ text, id, lang }).catch((cause: unknown) => {
    if (settled) return;
    settle();
    callbacks.onError(cause instanceof Error ? cause : new Error(String(cause)));
  });
  return () => {
    if (settled) return;
    settle();
    NativeVoice.stopSpeaking().catch((cause: unknown) => console.error('Native speech failed to stop', cause));
  };
}
