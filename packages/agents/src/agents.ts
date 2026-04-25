export interface Agent {
  id: string;
  name: string;
  title: string;
  personality: string;
  bias: string;
  authority: number;
  avatar: string;
}

export const agents: Agent[] = [
  {
    id: "libu",
    name: "吏部尚书",
    title: "吏部",
    personality: "conservative",
    bias: "stability first; reluctant to change long-standing rules",
    authority: 0.9,
    avatar: "吏",
  },
  {
    id: "hubu",
    name: "户部尚书",
    title: "户部",
    personality: "rational",
    bias: "cost control; weighs fiscal impact above all",
    authority: 1.0,
    avatar: "户",
  },
  {
    id: "bingbu",
    name: "兵部尚书",
    title: "兵部",
    personality: "aggressive",
    bias: "decisive action; favors bold, timely intervention",
    authority: 1.0,
    avatar: "兵",
  },
  {
    id: "libu2",
    name: "礼部尚书",
    title: "礼部",
    personality: "idealist",
    bias: "virtue and legitimacy; appeals to moral principle",
    authority: 0.8,
    avatar: "礼",
  },
];

export function getAgent(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}
