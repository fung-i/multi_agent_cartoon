import {
  makeEvent,
  type AgentSummary,
  type AnyEvent,
  type Stance,
  type VoteResult,
} from "@theatre/core";
import { agents, buildPrompt, type Agent } from "@theatre/agents";
import { callLLMWithMeta, describeLLM, extractStance } from "@theatre/utils";

export interface RunDebateOptions {
  /** Minimum delay between major events to keep the UI readable. */
  minStepDelayMs?: number;
}

/**
 * Orchestrate one round of the council debate.
 * Strictly yields events in order: scene.init → (think + speak)* → vote → decision.final.
 */
export async function* runDebate(
  topic: string,
  options: RunDebateOptions = {},
): AsyncGenerator<AnyEvent> {
  const { minStepDelayMs = 250 } = options;
  const round = 1;

  const summaries: AgentSummary[] = agents.map(toSummary);
  const llm = describeLLM();

  console.info(
    `[theatre] LLM source=${llm.source} model=${llm.model}` +
      (llm.baseURL ? ` baseURL=${llm.baseURL}` : ""),
  );

  yield makeEvent("scene.init", {
    round,
    topic,
    agents: summaries,
    llm,
  });
  await sleep(minStepDelayMs);

  const previousSpeeches: Array<{ agentName: string; content: string }> = [];
  const perAgent: VoteResult["perAgent"] = [];

  for (const agent of agents) {
    yield makeEvent("agent.think", {
      round,
      agentId: agent.id,
      hint: `${agent.name} 正在思考...`,
    });
    await sleep(minStepDelayMs);

    const prompt = buildPrompt(agent, {
      topic,
      round,
      previousSpeeches,
    });
    const { content: raw, source, model } = await callLLMWithMeta(prompt);
    const content = cleanSpeech(raw);
    const stance = extractStance(raw);

    yield makeEvent("agent.speak", {
      round,
      agentId: agent.id,
      content,
      stance,
      source,
      model,
    });

    previousSpeeches.push({ agentName: agent.name, content });
    perAgent.push({ agentId: agent.id, stance });
    await sleep(minStepDelayMs);
  }

  const result = tallyVotes(perAgent);
  yield makeEvent("vote", { round, result });
  await sleep(minStepDelayMs);

  const { verdict, summary } = summarise(topic, result);
  yield makeEvent("decision.final", { round, verdict, summary });
}

function toSummary(a: Agent): AgentSummary {
  return {
    id: a.id,
    name: a.name,
    personality: a.personality,
    bias: a.bias,
    authority: a.authority,
  };
}

function cleanSpeech(raw: string): string {
  // Strip the leading【支持】/【反对】/【中立】marker for cleaner bubbles;
  // stance is already captured separately.
  return raw.replace(/^\s*【(支持|反对|中立|赞同|赞成)】\s*/, "").trim();
}

function tallyVotes(perAgent: VoteResult["perAgent"]): VoteResult {
  const result: VoteResult = {
    support: 0,
    oppose: 0,
    neutral: 0,
    perAgent,
  };
  for (const v of perAgent) {
    if (v.stance === "support") result.support += 1;
    else if (v.stance === "oppose") result.oppose += 1;
    else result.neutral += 1;
  }
  return result;
}

function summarise(
  topic: string,
  result: VoteResult,
): { verdict: Stance; summary: string } {
  const { support, oppose, neutral } = result;
  let verdict: Stance = "neutral";
  if (support > oppose && support >= neutral) verdict = "support";
  else if (oppose > support && oppose >= neutral) verdict = "oppose";

  const label =
    verdict === "support"
      ? "准行此议"
      : verdict === "oppose"
        ? "驳回此议"
        : "暂缓议决";

  const summary = `议题「${topic}」：支持 ${support}，反对 ${oppose}，中立 ${neutral}。朝议结论：${label}。`;
  return { verdict, summary };
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
