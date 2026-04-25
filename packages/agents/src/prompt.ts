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

// const FORMAT = [
//   "输出格式（必须严格遵守）：",
//   "1. 立场必须明确：支持 / 反对 / 强烈反对 / 条件支持（禁止中立泛化）",
//   "2. 【冲突点】指出你与其他观点的分歧点",
//   "3. 【摘要】不超过 24 字",
//   "4. 【正文】1～3段论述",
//   "注意： 表达中需隐含你希望被采纳或被否决的倾向。允许在职能范围内表达倾向支持/反对某一方案，而不仅仅是技术分析。"
// ].join("");

const FORMAT = [
  "输出格式（必须严格遵守）：",
  // "1. 立场必须明确：支持 / 反对 / 强烈反对 / 条件支持（禁止中立泛化）",
  "1. 【冲突点】指出你与其他观点的分歧点",
  "2. 【摘要】不超过 24 字",
  "3. 【正文】1～3段论述",

  // ⭐ 关键新增（核心）
  "【模式规则】",
  "若议题属于决策/方案类问题：使用完整结构（方案、步骤、利弊）。",
  "若议题属于娱乐/叙事/开放问题（如算命、星座、故事）：",
  "→ 不强制生成多方案，可直接给出内容性回答；",
  "→ 但仍需保留“立场 + 摘要 + 正文”结构；",
  "→ 不要将问题强行转化为理性规划或方案设计。",

  "注意：表达中需隐含你希望被采纳或被否决的倾向。允许在职能范围内表达倾向支持/反对某一方向。",
].join("\n");

/** 中书省：先拟成案，直接回应用户议题 */
export function buildZhongshuPrompt(ctx: PromptContext): string {
  return [
    // `你扮演【中书令】（中书省）。${FORMAT}`,
    "角色：草案智能体。",
    `${FORMAT}`,
    "目标：根据问题类型生成合适形式的回答（决策类问题需提供方案，非决策类问题可直接给出内容），至少生成两个不同的回答以供选择。",
    "要求：每套方案都要写清关键假设、利弊与粗步骤，不得空泛。",
    "",
    `用户议题：${ctx.topic}`,
    "",
    "请输出你对该问题的方案，并在正文里分方案清晰展开。",
  ].join("\n");
}

/** 门下省：审议中书成案，表明是否支持颁行 */
export function buildMenxiaPrompt(
  ctx: PromptContext,
  zhongshuFullText: string,
): string {
  return [
    // `你扮演【侍中】（门下省）。${FORMAT}`,
    "角色：审议与反驳智能体。",
    `${FORMAT}`,
    "目标：审议草案，指出漏洞与风险，并提出可执行修订建议。",
    "约束：至少提出 3 条风险与 2 条修订建议，不得直接定案。",
    "",
    `议题：${ctx.topic}`,
    "",
    "【上一部设计方案】",
    zhongshuFullText,
    "",
    "请作审议：正文需明确反对点与修订建议，但不得直接替代之前方案。",
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
    ? `【方案（摘录）】\n${ctx.zhongshuPlan}\n`
    : "";
  const m = ctx.menxiaOpinion
    ? `【审核与反驳（摘录）】\n${ctx.menxiaOpinion}\n`
    : "";

  return [
    // `你扮演【${agent.name}】（${agent.title}）。${FORMAT}`,
    `性格：${agent.personality}。立场倾向：${agent.bias}。`,
    buildMinisterRoleGoal(agent.id),
    "交互要求：你必须读取并回应前序部门发言，明确写出你支持/反对/部分支持谁及原因。",
    "",
    `议题：${ctx.topic}`,
    "",
    z,
    m,
    "本席前六部同僚发言：",
    history,
    "",
    "请以你的职责表态并阐理，且正文中必须出现对前序观点的支持或反对。",
  ].join("\n");
}

function buildMinisterRoleGoal(agentId: Agent["id"]): string {
  switch (agentId) {
    case "xingbu":
      return "角色：风险与合规智能体。目标：识别高概率与高影响风险，并给出规避措施。";
    case "libu2":
      return "角色：流程规范与沟通智能体。目标：输出流程步骤与沟通要点。";
    case "libu":
      return "角色：分工与任务分配智能体。目标：把定稿转为可执行分工清单，尽量使用具体角色或人员。";
    case "hubu":
      return "角色：资源与预算评估智能体。目标：估算预算、人力、时间与资源缺口，给出区间与风险提示。";
    case "gongbu":
      return "角色：落地与工具交付智能体。目标：输出可落地的工具、模板或交付材料，并与资源/流程/执行路径一致。";
    case "bingbu":
      return "角色：执行路径规划智能体。目标：输出有序、可操作的执行步骤与里程碑。";
    default:
      return "目标：基于定稿从本部门职司提出可执行意见。";
  }
}
