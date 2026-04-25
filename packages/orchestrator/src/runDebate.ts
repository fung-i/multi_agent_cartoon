import {
  makeEvent,
  type AgentSummary,
  type AnyEvent,
  type Stance,
  type VoteResult,
} from "@theatre/core";
import {
  agents,
  getAgent,
  ministryAgents,
  buildZhongshuPrompt,
  buildMenxiaPrompt,
  buildMinisterPrompt,
  type Agent,
  type PromptContext,
} from "@theatre/agents";
import {
  callLLMWithMeta,
  describeLLM,
  parseStructuredSpeech,
  type CallLLMOptions,
} from "@theatre/utils";

export interface RunDebateOptions {
  minStepDelayMs?: number;
}

const DEBATE_OPTS: CallLLMOptions = {
  maxTokens: 700,
};

/**
 * 流程：scene.init → 中书省拟案 → 门下省审议 → 六部逐一发言 → 投票（仅六部）→
 * 面向用户的汇总答复（decision.final）。
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

  const baseCtx: PromptContext = {
    topic,
    round,
    previousSpeeches: [],
  };

  // —— 中书省 ——
  const zh = getAgent("zhongshu")!;
  yield makeEvent("agent.think", {
    round,
    agentId: zh.id,
    hint: `${zh.name} 草拟成案…`,
  });
  await sleep(minStepDelayMs);

  const rawZ = await callLLMWithMeta(
    buildZhongshuPrompt(baseCtx),
    DEBATE_OPTS,
  );
  const pZ = parseStructuredSpeech(rawZ.content);
  const zhongshuFull = pZ.content;
  yield makeEvent("agent.speak", {
    round,
    agentId: zh.id,
    content: pZ.content,
    summary: pZ.summary,
    stance: pZ.stance,
    source: rawZ.source,
    model: rawZ.model,
  });
  await sleep(minStepDelayMs);

  // —— 门下省 ——
  const mx = getAgent("menxia")!;
  yield makeEvent("agent.think", {
    round,
    agentId: mx.id,
    hint: `${mx.name} 审读封驳…`,
  });
  await sleep(minStepDelayMs);

  const rawM = await callLLMWithMeta(
    buildMenxiaPrompt(baseCtx, zhongshuFull),
    DEBATE_OPTS,
  );
  const pM = parseStructuredSpeech(rawM.content);
  const menxiaFull = pM.content;
  yield makeEvent("agent.speak", {
    round,
    agentId: mx.id,
    content: pM.content,
    summary: pM.summary,
    stance: pM.stance,
    source: rawM.source,
    model: rawM.model,
  });
  await sleep(minStepDelayMs);

  // —— 六部 ——
  const clip = (s: string, n: number) =>
    s.length <= n ? s : s.slice(0, n) + "…";
  const ministryCtxBase: PromptContext = {
    ...baseCtx,
    zhongshuPlan: clip(zhongshuFull, 1200),
    menxiaOpinion: clip(menxiaFull, 1200),
    previousSpeeches: [],
  };

  const ministryLines: Array<{ name: string; text: string }> = [];
  const perAgent: VoteResult["perAgent"] = [];
  const ministrySpeeches: PromptContext["previousSpeeches"] = [];

  for (const agent of ministryAgents) {
    yield makeEvent("agent.think", {
      round,
      agentId: agent.id,
      hint: `${agent.name} 斟酌部务…`,
    });
    await sleep(minStepDelayMs);

    const prompt = buildMinisterPrompt(agent, {
      ...ministryCtxBase,
      previousSpeeches: ministrySpeeches,
    });
    const raw = await callLLMWithMeta(prompt, DEBATE_OPTS);
    const p = parseStructuredSpeech(raw.content);

    yield makeEvent("agent.speak", {
      round,
      agentId: agent.id,
      content: p.content,
      summary: p.summary,
      stance: p.stance,
      source: raw.source,
      model: raw.model,
    });

    ministrySpeeches.push({ agentName: agent.name, content: p.content });
    ministryLines.push({ name: agent.name, text: p.content });
    perAgent.push({ agentId: agent.id, stance: p.stance });
    await sleep(minStepDelayMs);
  }

  const result = tallyVotes(perAgent);
  yield makeEvent("vote", { round, result });
  await sleep(minStepDelayMs);

  const { verdict, summary: templateSummary } = summarise(
    topic,
    result,
  );

  const userFace = await synthesizeForUser(
    topic,
    zhongshuFull,
    menxiaFull,
    ministryLines,
  );

  yield makeEvent("decision.final", {
    round,
    verdict,
    summary: userFace || templateSummary,
  });
}

function toSummary(a: Agent): AgentSummary {
  return {
    id: a.id,
    name: a.name,
    personality: a.personality,
    bias: a.bias,
    authority: a.authority,
    stageRow: a.row,
  };
}

async function synthesizeForUser(
  topic: string,
  zhongshu: string,
  menxia: string,
  ministries: Array<{ name: string; text: string }>,
): Promise<string> {
  const body = [
    "【中书省成案】",
    zhongshu,
    "",
    "【门下省裁示】",
    menxia,
    "",
    "【六部集议】",
    ...ministries.map((m) => `${m.name}：\n${m.text}`),
  ].join("\n");

  const prompt = `请根据以下议事记录，用面向用户的语气写「最终答复」：先给 1～2 句结论，再分点说明主要依据与可保留的争议点。不要用角色扮演，不要用【支持】等套话。议题：「${topic}」\n\n${body}`;

  try {
    const { content } = await callLLMWithMeta(prompt, {
      maxTokens: 800,
      systemMessage:
        "你是政务与政策类写作助手。只输出通顺的现代汉语，避免仿古口吻和标签格式。",
    });
    return content.trim() || "";
  } catch {
    return "";
  }
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
      ? "朝议在六部表决中偏支持"
      : verdict === "oppose"
        ? "朝议在六部表决中偏反对"
        : "朝议在六部表决中分歧较大";

  const summary = `议题「${topic}」经六部表决：支持 ${support}，反对 ${oppose}，中立 ${neutral}。${label}。`;
  return { verdict, summary };
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
