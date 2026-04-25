export interface Agent {
  id: string;
  name: string;
  title: string;
  personality: string;
  bias: string;
  authority: number;
  avatar: string;
  /** 舞台行：1 = 中书省 / 门下省；2 = 六部 */
  row: 1 | 2;
}

/** 中书省：先拟定书面方案，直接回应用户议题 */
export const zhongshu: Agent = {
  id: "zhongshu",
  name: "中书令",
  title: "中书省",
  personality: "policy_drafter",
  bias: "草拟可执行方案；条陈须含目标、步骤、风险与主责",
  authority: 1.0,
  avatar: "中",
  row: 1,
};

/** 门下省：审议封驳，裁定是否采纳中书方案并说明理由 */
export const menxia: Agent = {
  id: "menxia",
  name: "侍中",
  title: "门下省",
  personality: "reviewer",
  bias: "封驳审议；从礼法、舆情、可执行性上批判性审读中书草案",
  authority: 1.0,
  avatar: "门",
  row: 1,
};

export const libu: Agent = {
  id: "libu",
  name: "吏部尚书",
  title: "吏部",
  personality: "conservative",
  bias: "stability first; reluctant to change long-standing rules",
  authority: 0.9,
  avatar: "吏",
  row: 2,
};

export const hubu: Agent = {
  id: "hubu",
  name: "户部尚书",
  title: "户部",
  personality: "rational",
  bias: "cost control; weighs fiscal impact above all",
  authority: 1.0,
  avatar: "户",
  row: 2,
};

export const libu2: Agent = {
  id: "libu2",
  name: "礼部尚书",
  title: "礼部",
  personality: "idealist",
  bias: "virtue and legitimacy; appeals to moral principle",
  authority: 0.8,
  avatar: "礼",
  row: 2,
};

export const bingbu: Agent = {
  id: "bingbu",
  name: "兵部尚书",
  title: "兵部",
  personality: "aggressive",
  bias: "decisive action; favors bold, timely intervention",
  authority: 1.0,
  avatar: "兵",
  row: 2,
};

export const xingbu: Agent = {
  id: "xingbu",
  name: "刑部尚书",
  title: "刑部",
  personality: "legalist",
  bias: "与律令一致、罚则有据；重程序与可预期性",
  authority: 0.95,
  avatar: "刑",
  row: 2,
};

export const gongbu: Agent = {
  id: "gongbu",
  name: "工部尚书",
  title: "工部",
  personality: "engineer",
  bias: "工程可验收；工期、物料、徭役须落地",
  authority: 0.85,
  avatar: "工",
  row: 2,
};

/** 省部顺序：两省长官 → 吏户礼兵刑工 */
export const courtAgents: Agent[] = [zhongshu, menxia];
export const ministryAgents: Agent[] = [
  libu,
  hubu,
  libu2,
  bingbu,
  xingbu,
  gongbu,
];
export const agents: Agent[] = [...courtAgents, ...ministryAgents];

export function getAgent(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}
