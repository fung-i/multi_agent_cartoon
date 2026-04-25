"use client";

import type { AgentSummary, AnyEvent, Stance } from "@theatre/core";

interface EventRendererProps {
  event: AnyEvent;
  agentsById: Map<string, AgentSummary>;
  isLatestSpeak: boolean;
}

export function EventRenderer({
  event,
  agentsById,
  isLatestSpeak,
}: EventRendererProps) {
  switch (event.type) {
    case "scene.init":
      return (
        <div className="event event--scene">
          <span className="event__tag">开场</span>
          <p>
            议题：<b>{event.topic}</b>。{event.agents.length} 位大臣入朝参议。
          </p>
          {event.llm && (
            <p className="event__meta">
              模型来源：
              <span
                className={`source-badge source-badge--${event.llm.source}`}
              >
                {event.llm.source === "llm" ? "真实 LLM" : "离线 Mock"}
              </span>
              <span className="event__meta-model">{event.llm.model}</span>
              {event.llm.baseURL && (
                <span className="event__meta-host">
                  {safeHost(event.llm.baseURL)}
                </span>
              )}
            </p>
          )}
        </div>
      );
    case "agent.think": {
      const agent = agentsById.get(event.agentId);
      return (
        <div className="event event--think">
          <span className="event__tag">沉思</span>
          <p>{agent?.name ?? event.agentId} 正在斟酌措辞…</p>
        </div>
      );
    }
    case "agent.speak": {
      const agent = agentsById.get(event.agentId);
      return (
        <div
          className={[
            "bubble",
            `bubble--${event.stance}`,
            isLatestSpeak ? "bubble--fresh" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="bubble__head">
            <span className="bubble__avatar">
              {agent?.name?.slice(0, 1) ?? "?"}
            </span>
            <span className="bubble__name">{agent?.name ?? event.agentId}</span>
            <span className={`bubble__stance bubble__stance--${event.stance}`}>
              {stanceLabel(event.stance)}
            </span>
            {event.source && (
              <span
                className={`source-badge source-badge--${event.source}`}
                title={event.model ? `model: ${event.model}` : undefined}
              >
                {event.source === "llm" ? "LLM" : "Mock"}
              </span>
            )}
          </div>
          <p className="bubble__content">{event.content}</p>
        </div>
      );
    }
    case "agent.interrupt": {
      const agent = agentsById.get(event.agentId);
      return (
        <div className="event event--interrupt">
          <span className="event__tag">插言</span>
          <p>
            {agent?.name ?? event.agentId}：{event.content}
          </p>
        </div>
      );
    }
    case "vote":
      return (
        <div className="event event--vote">
          <span className="event__tag">投票</span>
          <div className="vote">
            <VoteBar label="支持" value={event.result.support} tone="support" />
            <VoteBar label="反对" value={event.result.oppose} tone="oppose" />
            <VoteBar label="中立" value={event.result.neutral} tone="neutral" />
          </div>
        </div>
      );
    case "decision.final":
      return (
        <div className={`event event--final event--${event.verdict}`}>
          <span className="event__tag">朝议结论</span>
          <p className="final__summary">{event.summary}</p>
        </div>
      );
    default: {
      const _exhaustive: never = event;
      return null;
    }
  }
}

function VoteBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Stance;
}) {
  return (
    <div className={`vote__row vote__row--${tone}`}>
      <span className="vote__label">{label}</span>
      <span className="vote__bar">
        <span
          className="vote__fill"
          style={{ width: `${Math.min(100, value * 25)}%` }}
        />
      </span>
      <span className="vote__value">{value}</span>
    </div>
  );
}

function stanceLabel(stance: Stance): string {
  if (stance === "support") return "支持";
  if (stance === "oppose") return "反对";
  return "中立";
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
