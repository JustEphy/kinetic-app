'use client';

import { useCallback, useRef, useState } from 'react';

type SpeechRecognitionType = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionType;
  webkitSpeechRecognition?: new () => SpeechRecognitionType;
}

export function useSpeechToText(onTranscript: (text: string) => void) {
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    const speechWindow = window as SpeechWindow;
    return Boolean(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition);
  });
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const speechWindow = window as SpeechWindow;
    const SpeechRecognitionCtor =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setError('Speech recognition is not supported on this device/browser.');
      return;
    }

    setError(null);
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      onTranscript(transcript.trim());
    };

    recognition.onerror = (event) => {
      setError(`Mic error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }
    startListening();
  }, [isListening, startListening, stopListening]);

  return { isSupported, isListening, error, toggleListening };
}

