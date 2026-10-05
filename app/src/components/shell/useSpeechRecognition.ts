import { useEffect, useRef, useState } from 'react';

interface RecognitionEngine {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionConstructor = new () => RecognitionEngine;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

interface Session {
  Recognition: RecognitionConstructor;
  engine: RecognitionEngine | null;
  text: string;
  prefix: string;
  timer: ReturnType<typeof setTimeout> | null;
  stopping: boolean;
  suspended: boolean;
  checkedFinal: string;
}

const VOICE_PAUSE_MS = 2000;

function recognitionError(code: SpeechRecognitionErrorCode): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed': return 'Microphone permission was denied.';
    case 'audio-capture': return 'No microphone is available.';
    case 'network': return 'Speech recognition lost its network connection.';
    case 'language-not-supported': return 'Speech recognition does not support this language.';
    default: return `Speech recognition stopped: ${code}.`;
  }
}

export function useSpeechRecognition(isOpen: boolean, onFinal: (text: string) => void, isScenario: (text: string) => Promise<boolean>) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const session = useRef<Session | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;
  const isScenarioRef = useRef(isScenario);
  isScenarioRef.current = isScenario;
  const supported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  const discard = (current: Session) => {
    if (session.current !== current) return;
    session.current = null;
    if (current.timer) clearTimeout(current.timer);
    current.engine?.abort();
    setText('');
    setIsListening(false);
    setIsSuspended(false);
  };

  const submitTurn = (current: Session) => {
    if (session.current !== current || current.stopping) return;
    if (current.timer) clearTimeout(current.timer);
    current.timer = null;
    const utterance = current.text.trim();
    if (!utterance) return;
    current.text = '';
    current.prefix = '';
    setText('');
    onFinalRef.current(utterance);
    current.stopping = true;
    try {
      current.engine?.stop();
    } catch (cause) {
      discard(current);
      setError(`Could not restart speech recognition: ${cause instanceof Error ? cause.message : String(cause)}`);
    }
  };

  const startEngine = (current: Session) => {
    if (current.suspended) return;
    const engine = new current.Recognition();
    current.engine = engine;
    current.stopping = false;
    engine.continuous = true;
    engine.interimResults = true;
    engine.lang = navigator.language || 'en-US';
    engine.onresult = (event) => {
      if (session.current !== current || current.engine !== engine || current.stopping) return;
      const recognized = Array.from(event.results).map((result) => result[0]?.transcript ?? '').join(' ');
      const next = [current.prefix, recognized].filter(Boolean).join(' ').trim();
      if (next !== current.text) {
        current.text = next;
        current.checkedFinal = '';
        setText(next);
        if (current.timer) clearTimeout(current.timer);
        if (next) current.timer = setTimeout(() => submitTurn(current), VOICE_PAUSE_MS);
      }
      if (event.results[event.results.length - 1]?.isFinal && next && current.checkedFinal !== next) {
        current.checkedFinal = next;
        void isScenarioRef.current(next).then((matched) => {
          if (matched && session.current === current && current.text === next && !current.suspended) submitTurn(current);
        }).catch((cause: unknown) => {
          console.error('Voice scenario matching failed', cause);
          setError('Could not check this voice request against available scenarios.');
        });
      }
    };
    engine.onerror = (event) => {
      if (session.current !== current || current.engine !== engine || current.stopping || event.error === 'no-speech') return;
      setError(recognitionError(event.error));
      discard(current);
    };
    engine.onend = () => {
      if (session.current !== current || current.engine !== engine) return;
      if (!current.stopping) current.prefix = current.text;
      current.engine = null;
      startEngine(current);
    };
    try {
      engine.start();
    } catch (cause) {
      discard(current);
      setError(`Could not start speech recognition: ${cause instanceof Error ? cause.message : String(cause)}`);
    }
  };

  const start = () => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition || session.current) return;
    const current: Session = { Recognition, engine: null, text: '', prefix: '', timer: null, stopping: false, suspended: false, checkedFinal: '' };
    session.current = current;
    setError('');
    setIsListening(true);
    setIsSuspended(false);
    startEngine(current);
  };

  const pauseForPlayback = () => {
    const current = session.current;
    if (!current || current.suspended) return;
    current.suspended = true;
    if (current.timer) clearTimeout(current.timer);
    current.timer = null;
    current.text = '';
    current.prefix = '';
    setText('');
    setIsListening(false);
    setIsSuspended(true);
    const engine = current.engine;
    current.engine = null;
    engine?.abort();
  };

  const resumeAfterPlayback = () => {
    const current = session.current;
    if (!current || !current.suspended) return;
    current.suspended = false;
    setIsSuspended(false);
    setIsListening(true);
    startEngine(current);
  };

  const stop = () => {
    const current = session.current;
    if (!current) return;
    const utterance = current.text.trim();
    discard(current);
    if (utterance) onFinalRef.current(utterance);
  };

  useEffect(() => {
    if (isOpen) return;
    const current = session.current;
    if (current) discard(current);
    setError('');
  }, [isOpen]);

  useEffect(() => () => {
    const current = session.current;
    if (!current) return;
    session.current = null;
    if (current.timer) clearTimeout(current.timer);
    current.engine?.abort();
  }, []);

  return { supported, isListening, isSuspended, text, error, start, stop, pauseForPlayback, resumeAfterPlayback };
}
