"use client";

import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ReadAloudButtonProps {
  text: string;
  enabled: boolean;
  rate: number;
  className?: string;
}

export default function ReadAloudButton({
  text,
  enabled,
  rate,
  className = "",
}: ReadAloudButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setPaused(false);
    }
  }, [enabled]);

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  if (!enabled) return null;

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
    setError("");
  };

  const start = () => {
    if (!supported) {
      setError("Read aloud is not supported by this browser.");
      return;
    }
    const readableText = text.trim();
    if (!readableText) {
      setError("There is no text available to read.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(readableText);
    utterance.rate = rate;
    utterance.onstart = () => {
      setSpeaking(true);
      setPaused(false);
      setError("");
    };
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onerror = (event) => {
      setSpeaking(false);
      setPaused(false);
      setError(event.error === "canceled" || event.error === "interrupted" ? "" : "Read aloud could not be completed.");
    };

    try {
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
      setPaused(false);
      setError("");
    } catch {
      setSpeaking(false);
      setError("Read aloud could not be started. Try again.");
    }
  };

  const togglePause = () => {
    if (!supported) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      {!speaking ? (
        <button
          type="button"
          onClick={start}
          disabled={!supported}
          aria-label={supported ? "Read this information aloud" : "Read aloud is unavailable"}
          title={supported ? "Read aloud" : "Read aloud is not supported in this browser"}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-omega-lilac bg-white px-3 py-2 text-sm font-medium text-omega-purple transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple disabled:opacity-50"
        >
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          <span>Read aloud</span>
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={togglePause}
            aria-label={paused ? "Resume reading" : "Pause reading"}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-omega-lilac bg-white px-3 py-2 text-sm font-medium text-omega-purple focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple"
          >
            {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
            <span>{paused ? "Resume" : "Pause"}</span>
          </button>
          <button
            type="button"
            onClick={stop}
            aria-label="Stop reading"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-omega-lilac bg-white px-3 py-2 text-sm font-medium text-omega-purple focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple"
          >
            <Square className="h-4 w-4" aria-hidden="true" />
            <span>Stop</span>
          </button>
        </>
      )}
      {error ? <span className="text-xs text-red-700" role="alert">{error}</span> : null}
    </div>
  );
}
