"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnyEvent } from "@theatre/core";

export type StreamStatus = "idle" | "connecting" | "streaming" | "done" | "error";

export interface UseEventStream {
  events: AnyEvent[];
  status: StreamStatus;
  error?: string;
  start: (topic: string) => void;
  reset: () => void;
}

export function useEventStream(): UseEventStream {
  const [events, setEvents] = useState<AnyEvent[]>([]);
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [error, setError] = useState<string | undefined>();
  const sourceRef = useRef<EventSource | null>(null);

  const closeSource = useCallback(() => {
    sourceRef.current?.close();
    sourceRef.current = null;
  }, []);

  useEffect(() => closeSource, [closeSource]);

  const reset = useCallback(() => {
    closeSource();
    setEvents([]);
    setStatus("idle");
    setError(undefined);
  }, [closeSource]);

  const start = useCallback(
    (topic: string) => {
      const clean = topic.trim();
      if (!clean) return;

      closeSource();
      setEvents([]);
      setError(undefined);
      setStatus("connecting");

      const url = `/api/stream?topic=${encodeURIComponent(clean)}`;
      const es = new EventSource(url);
      sourceRef.current = es;

      es.onopen = () => setStatus("streaming");

      es.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(evt.data) as AnyEvent;
          setEvents((prev) => [...prev, parsed]);
        } catch (err) {
          console.error("Failed to parse SSE event", err, evt.data);
        }
      };

      es.addEventListener("done", () => {
        setStatus("done");
        closeSource();
      });

      es.addEventListener("error", (evt) => {
        const ev = evt as MessageEvent;
        let message = "Stream error";
        if (typeof ev.data === "string" && ev.data) {
          try {
            const parsed = JSON.parse(ev.data) as { message?: string };
            message = parsed.message ?? message;
          } catch {
            message = ev.data;
          }
        }
        setError(message);
        setStatus("error");
        closeSource();
      });

      es.onerror = () => {
        // Only transition to error if we haven't already finished cleanly.
        setStatus((prev) => (prev === "done" ? prev : "error"));
        closeSource();
      };
    },
    [closeSource],
  );

  return { events, status, error, start, reset };
}
