import type { Agent } from "./agents";

export interface PromptContext {
  topic: string;
  round: number;
  previousSpeeches: Array<{
    agentName: string;
    content: string;
  }>;
}

/**
 * Build a role-specific prompt. The mock LLM matches on Chinese role names
 * and bias keywords, so we deliberately include both.
 */
export function buildPrompt(agent: Agent, ctx: PromptContext): string {
  const history =
    ctx.previousSpeeches.length === 0
      ? "（你是第一位发言的大臣。）"
      : ctx.previousSpeeches
          .map((s, i) => `${i + 1}. ${s.agentName}：${s.content}`)
          .join("\n");

  return [
    `你现在扮演【${agent.name}】（${agent.title}）。`,
    `性格：${agent.personality}。立场倾向：${agent.bias}。`,
    "",
    `议题：${ctx.topic}`,
    "",
    "此前朝堂发言：",
    history,
    "",
    "请以你的身份发言。要求：",
    "1. 用第一行的【支持】/【反对】/【中立】明确表态；",
    "2. 结合你的身份与立场阐述理由，不要空话套话；",
    "3. 中文，不超过 80 字。",
  ].join("\n");
}
