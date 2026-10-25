"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SpeechAlternative {
  transcript: string;
}

interface SpeechResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechAlternative;
}

interface SpeechResultEvent {
  resultIndex: number;
  results: ArrayLike<SpeechResult>;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
}

interface SpeechToTextButtonProps {
  onTranscript: (transcript: string) => void;
  className?: string;
}

function recognitionErrorMessage(error: string) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission was denied. Allow microphone access in your browser settings or type your entry.";
    case "audio-capture":
      return "No microphone was detected. Connect a microphone or type your entry.";
    case "no-speech":
      return "No speech was detected. Try again or type your entry.";
    case "network":
      return "Speech recognition could not connect. Try again or type your entry.";
    default:
      return "Speech recognition stopped unexpectedly. Try again or type your entry.";
  }
}

export default function SpeechToTextButton({
  onTranscript,
  className = "",
}: SpeechToTextButtonProps) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const speechWindow = window as SpeechRecognitionWindow;
    setSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const startListening = () => {
    const speechWindow = window as SpeechRecognitionWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setStatus("Speech recognition is not available in this browser. Type your entry instead.");
      setSupported(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    setStatus("Listening… speak clearly, then pause to finish.");
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length - event.resultIndex }, (_, index) => {
        const result = event.results[event.resultIndex + index];
        return result.isFinal && result.length ? result[0].transcript.trim() : "";
      }).filter(Boolean).join(" ");

      if (transcript) {
        onTranscript(transcript);
        setStatus("Transcription added. You can edit it before saving.");
      }
    };

    recognition.onerror = (event) => {
      setListening(false);
      setStatus(recognitionErrorMessage(event.error));
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setStatus("Could not start speech recognition. Try again or type your entry.");
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={listening ? stopListening : startListening}
        disabled={!supported && !listening}
        aria-label={listening ? "Stop dictation" : supported ? "Start dictation" : "Dictation unavailable"}
        aria-pressed={listening}
        title={supported ? (listening ? "Stop dictation" : "Start dictation") : "Speech recognition is not supported in this browser"}
        className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-omega-lilac bg-white p-2 text-omega-purple shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {listening ? <MicOff className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
      </button>
      <span className="max-w-xs text-xs leading-5 text-omega-slate" role="status" aria-live="polite">
        {status || (supported ? "Dictation uses your browser’s speech service; audio is not saved." : "Dictation is unavailable here. Type your entry instead.")}
      </span>
    </div>
  );
}
