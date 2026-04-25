import type { Agent } from "./agents";

export interface PromptContext {
  topic: string;
  round: number;
  previousSpeeches: Array<{
    agentName: string;
    content: string;
  }>;
  zhongshuPlan?: string;
  menxiaOpinion?: string;
}

const FORMAT = [
  "输出格式（必须严格遵守）：",
  "1. 立场必须明确：支持 / 反对 / 强烈反对 / 条件支持（禁止中立泛化）",
  "2. 【冲突点】必须指出你与其他观点的分歧点（关键）",
  "3. 【摘要】不超过 24 字",
  "4. 【正文】1～3段论述",
].join("");

/** 中书省：先拟成案，直接回应用户议题 */
export function buildZhongshuPrompt(ctx: PromptContext): string {
  return [
    `你扮演【中书令】（中书省）。${FORMAT}`,
    `职责：草拟可落地政策文书；须含目标、步骤、主责、风险，忌空话。`,
    "",
    `用户议题：${ctx.topic}`,
    "",
    "请输出中书省对议题的拟案。",
  ].join("\n");
}

/** 门下省：审议中书成案，表明是否支持颁行 */
export function buildMenxiaPrompt(
  ctx: PromptContext,
  zhongshuFullText: string,
): string {
  return [
    `你扮演【侍中】（门下省）。${FORMAT}`,
    `职责：封驳审议；从礼法、舆情、可执行性指出问题点。`,
    "",
    `议题：${ctx.topic}`,
    "",
    "【中书省所拟成案】",
    zhongshuFullText,
    "",
    "请作门下省审议：是否支持以中书所拟为主干颁行？正文中写清须补充或修正之处。",
  ].join("\n");
}

/** 六部：在中书方案与门下裁示基础上专业发言 */
export function buildMinisterPrompt(agent: Agent, ctx: PromptContext): string {
  const history =
    ctx.previousSpeeches.length === 0
      ? "（你是六部中第一位发言者。）"
      : ctx.previousSpeeches
          .map((s, i) => `${i + 1}. ${s.agentName}：${s.content}`)
          .join("\n");

  const z = ctx.zhongshuPlan
    ? `【中书省方案（摘录）】\n${ctx.zhongshuPlan}\n`
    : "";
  const m = ctx.menxiaOpinion
    ? `【门下省裁示（摘录）】\n${ctx.menxiaOpinion}\n`
    : "";

  return [
    `你扮演【${agent.name}】（${agent.title}）。${FORMAT}`,
    `性格：${agent.personality}。立场倾向：${agent.bias}。`,
    "",
    `议题：${ctx.topic}`,
    "",
    z,
    m,
    "本席前六部同僚发言：",
    history,
    "",
    "请以你部职司出发表态并阐理。",
  ].join("\n");
}
