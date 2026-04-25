"use client";

import { useEffect, useState } from "react";
import type { AgentSummary, Stance } from "@theatre/core";
import { MinisterAvatar, type AvatarState } from "./MinisterAvatar";

export interface LatestSpeech {
  agentId: string;
  content: string;
  summary: string;
  stance: Stance;
}

export interface Verdict {
  verdict: Stance;
  summary: string;
}

interface SceneProps {
  topic?: string;
  agents: AgentSummary[];
  thinkingAgentId?: string;
  speakingAgentId?: string;
  latestSpeech?: LatestSpeech;
  verdict?: Verdict;
  speechesByAgentId?: Map<string, string[]>;
}

export function Scene({
  topic,
  agents,
  thinkingAgentId,
  speakingAgentId,
  latestSpeech,
  verdict,
  speechesByAgentId,
}: SceneProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>();

  useEffect(() => {
    setDetailOpen(false);
  }, [latestSpeech?.agentId, speakingAgentId]);

  useEffect(() => {
    if (!agents.length) {
      setSelectedAgentId(undefined);
      return;
    }
    if (!selectedAgentId || !agents.some((a) => a.id === selectedAgentId)) {
      setSelectedAgentId(agents[0]!.id);
    }
  }, [agents, selectedAgentId]);

  const upper = agents.filter((a) => a.stageRow === 1);
  const lower = agents.filter((a) => a.stageRow === 2);
  const useTwoRows = upper.length > 0 && lower.length > 0;
  const rows =
    agents.length === 0
      ? []
      : useTwoRows
        ? [
            {
              key: "upper",
              list: upper,
              className: "stage__row stage__row--upper",
            },
            {
              key: "lower",
              list: lower,
              className: "stage__row stage__row--lower",
            },
          ]
        : [{ key: "all", list: agents, className: "stage__row" }];
  const selectedAgent = selectedAgentId
    ? agents.find((a) => a.id === selectedAgentId)
    : undefined;
  const selectedSpeeches = selectedAgentId
    ? speechesByAgentId?.get(selectedAgentId) ?? []
    : [];

  return (
    <section className="stage">
      <div className="stage__banner">
        <span className="stage__banner-seal">朝</span>
        <span className="stage__banner-topic">{topic ?? "等待议题…"}</span>
        <span className="stage__banner-seal">堂</span>
      </div>

      <div className="stage__hall">
        <div className="stage__pillar stage__pillar--left" />
        <div className="stage__pillar stage__pillar--right" />
        <div className="stage__lanterns">
          <span />
          <span />
          <span />
          <span />
        </div>

        {agents.length === 0 && (
          <p className="stage__empty">尚未入场…</p>
        )}

        {rows.map((row) => (
          <div key={row.key} className={row.className}>
            {row.list.map((a) => {
                const isSpeaking = a.id === speakingAgentId;
                const isThinking = a.id === thinkingAgentId && !isSpeaking;
                const isLast = latestSpeech?.agentId === a.id;
                const state: AvatarState = isSpeaking
                  ? "speaking"
                  : isThinking
                    ? "thinking"
                    : isLast && latestSpeech
                      ? stanceMood(latestSpeech.stance)
                      : "idle";

                const hasDetail =
                  latestSpeech &&
                  isSpeaking &&
                  latestSpeech.content &&
                  latestSpeech.summary &&
                  latestSpeech.content.trim() !==
                    latestSpeech.summary.trim() &&
                  latestSpeech.content.length > latestSpeech.summary.length + 2;

                return (
                  <div
                    key={a.id}
                    className={[
                      "minister-slot",
                      isSpeaking && "is-speaking",
                      isThinking && "is-thinking",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {isThinking && (
                      <div className="stage-bubble stage-bubble--think" aria-hidden>
                        <span />
                        <span />
                        <span />
                      </div>
                    )}
                    {isSpeaking && latestSpeech && (
                      <div
                        className={`stage-bubble stage-bubble--speak stage-bubble--text stage-bubble--${latestSpeech.stance}`}
                      >
                        <span
                          className={`stage-bubble__stance stage-bubble__stance--${latestSpeech.stance}`}
                        >
                          {stanceLabel(latestSpeech.stance)}
                        </span>
                        <p className="stage-bubble__lede">
                          {hasDetail && !detailOpen
                            ? latestSpeech.summary
                            : latestSpeech.content}
                        </p>
                        {hasDetail && (
                          <button
                            type="button"
                            className="stage-bubble__toggle"
                            onClick={() => setDetailOpen((v) => !v)}
                          >
                            {detailOpen ? "收起" : "展开全文"}
                          </button>
                        )}
                      </div>
                    )}
                    <div
                      className={[
                        "minister-slot__body",
                        selectedAgentId === a.id && "is-selected",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedAgentId(a.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedAgentId(a.id);
                        }
                      }}
                      aria-label={`查看${a.name}发言`}
                    >
                      <MinisterAvatar agentId={a.id} state={state} />
                    </div>
                    <div
                      className={[
                        "minister-plaque",
                        selectedAgentId === a.id && "is-selected",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedAgentId(a.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedAgentId(a.id);
                        }
                      }}
                      aria-label={`查看${a.name}发言`}
                    >
                      <b>{a.name}</b>
                      <em>{personalityLabel(a.personality)}</em>
                    </div>
                  </div>
                );
              })}
          </div>
        ))}

        <div className="stage__floor" />
      </div>

      {selectedAgent && (
        <div className="stage-log">
          <div className="stage-log__title">{selectedAgent.name} 发言记录</div>
          {selectedSpeeches.length === 0 ? (
            <p className="stage-log__empty">点击了该人物，但目前还没有发言。</p>
          ) : (
            <div className="stage-log__list">
              {selectedSpeeches.map((text, i) => (
                <p key={`${selectedAgent.id}-${i}`} className="stage-log__item">
                  {i + 1}. {text}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {verdict && (
        <div className={`verdict verdict--${verdict.verdict}`}>
          <div className="verdict__scroll">
            <div className="verdict__title">给用户的汇总答复</div>
            <p>{verdict.summary}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function stanceMood(s: Stance): AvatarState {
  if (s === "support") return "happy";
  if (s === "oppose") return "angry";
  return "idle";
}

function stanceLabel(s: Stance): string {
  if (s === "support") return "支持";
  if (s === "oppose") return "反对";
  return "中立";
}

function personalityLabel(p: string): string {
  const map: Record<string, string> = {
    conservative: "守成持重",
    rational: "理性算计",
    aggressive: "果决进取",
    idealist: "崇德尚礼",
    policy_drafter: "典章拟旨",
    reviewer: "封驳审读",
    legalist: "明刑弼教",
    engineer: "经制营造",
  };
  return map[p] ?? p;
}
