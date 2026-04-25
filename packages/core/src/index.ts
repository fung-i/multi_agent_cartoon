export type EventType =
  | "scene.init"
  | "agent.think"
  | "agent.speak"
  | "agent.interrupt"
  | "vote"
  | "decision.final";

export type Stance = "support" | "oppose" | "neutral";

export interface BaseEvent {
  id: string;
  timestamp: number;
  round: number;
  type: EventType;
  agentId?: string;
}

export interface AgentSummary {
  id: string;
  name: string;
  personality: string;
  bias: string;
  authority: number;
  /** 1 = 中书/门下；2 = 六部 */
  stageRow?: 1 | 2;
}

export interface LLMInfoPayload {
  /** "llm" when a real provider is configured; "mock" otherwise. */
  source: "llm" | "mock";
  model: string;
  baseURL?: string;
}

export interface SceneInitEvent extends BaseEvent {
  type: "scene.init";
  topic: string;
  agents: AgentSummary[];
  llm?: LLMInfoPayload;
}

export interface AgentThinkEvent extends BaseEvent {
  type: "agent.think";
  agentId: string;
  hint?: string;
}

export interface AgentSpeakEvent extends BaseEvent {
  type: "agent.speak";
  agentId: string;
  content: string;
  /** 一句短摘要，默认展示；完整论证见 content */
  summary?: string;
  stance: Stance;
  /** Where this utterance actually came from. */
  source?: "llm" | "mock";
  /** Model id reported by the provider (or "mock"). */
  model?: string;
}

export interface AgentInterruptEvent extends BaseEvent {
  type: "agent.interrupt";
  agentId: string;
  targetAgentId: string;
  content: string;
}

export interface VoteResult {
  support: number;
  oppose: number;
  neutral: number;
  perAgent: Array<{ agentId: string; stance: Stance }>;
}

export interface VoteEvent extends BaseEvent {
  type: "vote";
  result: VoteResult;
}

export interface DecisionFinalEvent extends BaseEvent {
  type: "decision.final";
  verdict: Stance;
  summary: string;
}

export type AnyEvent =
  | SceneInitEvent
  | AgentThinkEvent
  | AgentSpeakEvent
  | AgentInterruptEvent
  | VoteEvent
  | DecisionFinalEvent;

type EventByType<T extends EventType> = Extract<AnyEvent, { type: T }>;
type EventPayload<T extends EventType> = Omit<
  EventByType<T>,
  "id" | "timestamp" | "type"
>;

/**
 * Build a fully-populated event of the given type. Fills in a stable id and
 * timestamp so callers only have to supply the meaningful payload.
 */
export function makeEvent<T extends EventType>(
  type: T,
  payload: EventPayload<T>,
): EventByType<T> {
  return {
    id: newId(),
    timestamp: Date.now(),
    type,
    ...payload,
  } as EventByType<T>;
}

function newId(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return `evt_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}
