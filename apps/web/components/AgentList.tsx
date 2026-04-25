"use client";

import type { AgentSummary } from "@theatre/core";

interface AgentListProps {
  agents: AgentSummary[];
}

export function AgentList({ agents }: AgentListProps) {
  if (agents.length === 0) return null;
  return (
    <aside className="agents">
      <h3 className="agents__title">参议者</h3>
      <ul className="agents__list">
        {agents.map((a) => (
          <li key={a.id} className="agents__item">
            <span className="agents__name">{a.name}</span>
            <span className="agents__bias" title={a.bias}>
              {a.personality}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
