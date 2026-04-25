"use client";

import { useEffect, useState } from "react";
import type { AgentSummary, AnyEvent, Stance } from "@theatre/core";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

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
            议题：<b>{event.topic}</b>。流程：中书省拟案 → 门下省审议 → 六部集议 →
            汇总答复。共 {event.agents.length} 位入朝。
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
        <SpeakCard
          event={event}
          agentName={agent?.name ?? event.agentId}
          isLatestSpeak={isLatestSpeak}
        />
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
    case "vote": {
      const n = Math.max(1, event.result.perAgent.length);
      return (
        <div className="event event--vote">
          <span className="event__tag">投票</span>
          <p className="event__vote-hint">（六部意向统计）</p>
          <div className="vote">
            <VoteBar
              label="支持"
              value={event.result.support}
              tone="support"
              max={n}
            />
            <VoteBar
              label="反对"
              value={event.result.oppose}
              tone="oppose"
              max={n}
            />
            <VoteBar
              label="中立"
              value={event.result.neutral}
              tone="neutral"
              max={n}
            />
          </div>
        </div>
      );
    }
    case "decision.final":
      return (
        <div className={`event event--final event--${event.verdict}`}>
          <span className="event__tag">汇总答复</span>
          <div className="final__summary final__summary--user markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {event.summary}
            </ReactMarkdown>
          </div>
        </div>
      );
    default: {
      const _exhaustive: never = event;
      return null;
    }
  }
}

function SpeakCard({
  event,
  agentName,
  isLatestSpeak,
}: {
  event: Extract<AnyEvent, { type: "agent.speak" }>;
  agentName: string;
  isLatestSpeak: boolean;
}) {
  const [open, setOpen] = useState(false);

  const summary = event.summary?.trim();
  const content = event.content?.trim() ?? "";
  const showToggle = Boolean(
    summary &&
      content &&
      summary !== content &&
      content.length > summary.length + 2,
  );

  useEffect(() => {
    if (isLatestSpeak) setOpen(false);
  }, [isLatestSpeak, event.id]);

  const display = !showToggle
    ? content
    : open
      ? content
      : summary!;

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
        <span className="bubble__avatar">{agentName.slice(0, 1)}</span>
        <span className="bubble__name">{agentName}</span>
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
      <p className="bubble__lede bubble__content--readable">{display}</p>
      {showToggle && (
        <button
          type="button"
          className="bubble__expand"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "收起" : "展开完整论述"}
        </button>
      )}
    </div>
  );
}

function VoteBar({
  label,
  value,
  tone,
  max,
}: {
  label: string;
  value: number;
  tone: Stance;
  max: number;
}) {
  return (
    <div className={`vote__row vote__row--${tone}`}>
      <span className="vote__label">{label}</span>
      <span className="vote__bar">
        <span
          className="vote__fill"
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
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
