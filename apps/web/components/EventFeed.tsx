"use client";

import { useEffect, useRef } from "react";
import type { AgentSummary, AnyEvent } from "@theatre/core";
import { EventRenderer } from "./EventRenderer";

interface EventFeedProps {
  events: AnyEvent[];
  agentsById: Map<string, AgentSummary>;
}

export function EventFeed({ events, agentsById }: EventFeedProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [events.length]);

  const latestSpeakId = findLatestSpeakId(events);

  return (
    <section className="feed">
      <h3 className="feed__title">事件流</h3>
      <div className="feed__list">
        {events.length === 0 ? (
          <p className="feed__empty">尚未开议。输入议题后点「启奏」即可开始。</p>
        ) : (
          events.map((ev) => (
            <EventRenderer
              key={ev.id}
              event={ev}
              agentsById={agentsById}
              isLatestSpeak={ev.id === latestSpeakId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </section>
  );
}

function findLatestSpeakId(events: AnyEvent[]): string | undefined {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i]!;
    if (e.type === "agent.speak") return e.id;
  }
  return undefined;
}
