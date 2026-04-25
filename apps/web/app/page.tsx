"use client";

import { useMemo, useState } from "react";
import type { AgentSummary, AnyEvent, Stance } from "@theatre/core";
import { Scene, type LatestSpeech, type Verdict } from "@/components/Scene";
import { EventFeed } from "@/components/EventFeed";
import { useEventStream } from "@/hooks/useEventStream";

export default function HomePage() {
  const [input, setInput] = useState("");
  const { events, status, error, start, reset } = useEventStream();

  const {
    topic,
    agents,
    speakingAgentId,
    thinkingAgentId,
    latestSpeech,
    verdict,
    agentsById,
    speechesByAgentId,
  } = useDerivedState(events);

  const running = status === "connecting" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (running) return;
    start(input);
  };

  return (
    <main className="page">
      <header className="page__header">
        <h1>AI Agent Theatre</h1>
        <p className="page__subtitle">
          中书省拟案 → 门下省审议 → 六部集议 →
          汇总答复。摘要可在事件流中展开。
        </p>
      </header>

      <form className="topic" onSubmit={handleSubmit}>
        <input
          className="topic__input"
          placeholder="例：是否应当加征商税以充实国库？"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={running}
        />
        <button
          className="topic__submit"
          type="submit"
          disabled={running || input.trim().length === 0}
        >
          {running ? "议政中…" : "启奏"}
        </button>
        {events.length > 0 && !running && (
          <button
            type="button"
            className="topic__reset"
            onClick={() => {
              reset();
              setInput("");
            }}
          >
            重开
          </button>
        )}
      </form>

      {error && <div className="error">流程异常：{error}</div>}

      <Scene
        topic={topic}
        agents={agents}
        speakingAgentId={speakingAgentId}
        thinkingAgentId={thinkingAgentId}
        latestSpeech={latestSpeech}
        verdict={verdict}
        speechesByAgentId={speechesByAgentId}
      />

      <div className="grid">
        <div className="grid__main">
          <EventFeed events={events} agentsById={agentsById} />
        </div>
        <div className="grid__side">
          <StatusPanel status={status} count={events.length} />
        </div>
      </div>
    </main>
  );
}

function StatusPanel({
  status,
  count,
}: {
  status: string;
  count: number;
}) {
  return (
    <aside className="status">
      <div className="status__row">
        <span>状态</span>
        <b>{status}</b>
      </div>
      <div className="status__row">
        <span>事件数</span>
        <b>{count}</b>
      </div>
    </aside>
  );
}

function useDerivedState(events: AnyEvent[]) {
  return useMemo(() => {
    let topic: string | undefined;
    let agents: AgentSummary[] = [];
    let thinkingAgentId: string | undefined;
    let speakingAgentId: string | undefined;
    let latestSpeech: LatestSpeech | undefined;
    let verdict: Verdict | undefined;

    for (const ev of events) {
      if (ev.type === "scene.init") {
        topic = ev.topic;
        agents = ev.agents;
      } else if (ev.type === "agent.think") {
        thinkingAgentId = ev.agentId;
      } else if (ev.type === "agent.speak") {
        speakingAgentId = ev.agentId;
        thinkingAgentId = undefined;
        latestSpeech = {
          agentId: ev.agentId,
          content: ev.content,
          summary: (ev.summary?.trim() || ev.content).trim(),
          stance: ev.stance as Stance,
        };
      } else if (ev.type === "vote") {
        speakingAgentId = undefined;
        thinkingAgentId = undefined;
      } else if (ev.type === "decision.final") {
        speakingAgentId = undefined;
        thinkingAgentId = undefined;
        verdict = { verdict: ev.verdict, summary: ev.summary };
      }
    }

    const agentsById = new Map<string, AgentSummary>(
      agents.map((a) => [a.id, a]),
    );
    const speechesByAgentId = new Map<string, string[]>();
    for (const ev of events) {
      if (ev.type !== "agent.speak") continue;
      const list = speechesByAgentId.get(ev.agentId) ?? [];
      list.push((ev.content || "").trim());
      speechesByAgentId.set(ev.agentId, list);
    }

    return {
      topic,
      agents,
      thinkingAgentId,
      speakingAgentId,
      latestSpeech,
      verdict,
      agentsById,
      speechesByAgentId,
    };
  }, [events]);
}
