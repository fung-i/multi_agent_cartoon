"use client";

import { useMemo, useState } from "react";
import type { AgentSummary, AnyEvent } from "@theatre/core";
import { Scene } from "@/components/Scene";
import { AgentList } from "@/components/AgentList";
import { EventFeed } from "@/components/EventFeed";
import { useEventStream } from "@/hooks/useEventStream";

export default function HomePage() {
  const [input, setInput] = useState("");
  const { events, status, error, start, reset } = useEventStream();

  const { topic, agents, currentAgentId, thinkingAgentId, agentsById } =
    useDerivedState(events);

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
          输入一个议题，诸位大臣将逐一发言、投票并给出结论。
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

      <div className="grid">
        <div className="grid__main">
          <Scene
            topic={topic}
            agents={agents}
            currentAgentId={currentAgentId}
            thinkingAgentId={thinkingAgentId}
          />
          <EventFeed events={events} agentsById={agentsById} />
        </div>
        <div className="grid__side">
          <AgentList agents={agents} />
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
    let currentAgentId: string | undefined;

    for (const ev of events) {
      if (ev.type === "scene.init") {
        topic = ev.topic;
        agents = ev.agents;
      } else if (ev.type === "agent.think") {
        thinkingAgentId = ev.agentId;
      } else if (ev.type === "agent.speak") {
        currentAgentId = ev.agentId;
        thinkingAgentId = undefined;
      } else if (ev.type === "vote" || ev.type === "decision.final") {
        currentAgentId = undefined;
        thinkingAgentId = undefined;
      }
    }

    const agentsById = new Map<string, AgentSummary>(
      agents.map((a) => [a.id, a]),
    );

    return { topic, agents, currentAgentId, thinkingAgentId, agentsById };
  }, [events]);
}
