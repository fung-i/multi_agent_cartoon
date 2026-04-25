"use client";

import type { AgentSummary } from "@theatre/core";

interface SceneProps {
  topic?: string;
  agents: AgentSummary[];
  currentAgentId?: string;
  thinkingAgentId?: string;
}

export function Scene({
  topic,
  agents,
  currentAgentId,
  thinkingAgentId,
}: SceneProps) {
  return (
    <section className="scene">
      <header className="scene__header">
        <span className="scene__label">朝堂</span>
        <h2 className="scene__topic">{topic ?? "等待议题…"}</h2>
      </header>
      <div className="scene__stage">
        {agents.length === 0 ? (
          <p className="scene__empty">尚未入场…</p>
        ) : (
          agents.map((a) => {
            const isSpeaking = a.id === currentAgentId;
            const isThinking = a.id === thinkingAgentId && !isSpeaking;
            return (
              <div
                key={a.id}
                className={[
                  "scene__agent",
                  isSpeaking ? "is-speaking" : "",
                  isThinking ? "is-thinking" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="scene__avatar">{a.name.slice(0, 1)}</div>
                <div className="scene__name">{a.name}</div>
                <div className="scene__status">
                  {isSpeaking ? "发言中" : isThinking ? "思考中…" : ""}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
