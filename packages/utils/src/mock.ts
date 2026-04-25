/**
 * Deterministic-ish fake LLM used when no OPENAI_API_KEY is configured.
 * We scan the prompt for the agent's display name + bias keywords so each
 * role feels distinct even in offline mode.
 */
// Patterns are matched against the persona block of the prompt only, so
// we intentionally key off the personality label (which is unique per agent
// and does not leak into the "previous speeches" section of the prompt).
const TEMPLATES: Array<{
  match: RegExp;
  stance: "支持" | "反对" | "中立";
  lines: string[];
}> = [
  {
    match: /conservative|stability/i,
    stance: "反对",
    lines: [
      "轻举妄动恐伤根本，当以稳为先。",
      "祖制不可轻废，贸然变更必生乱象。",
      "朝纲宜稳，此议仓促，臣不敢苟同。",
    ],
  },
  {
    match: /rational|cost control|fiscal/i,
    stance: "中立",
    lines: [
      "国库账目须先核清，再议方不误事。",
      "若开支可控、税源有继，方可缓步推行。",
      "利弊须算明白，不能只凭一时热血。",
    ],
  },
  {
    match: /aggressive|decisive|bold/i,
    stance: "支持",
    lines: [
      "机不可失，当断则断，速行此策！",
      "坐视不理，祸患必至，臣请即刻施行。",
      "时局紧迫，唯有雷厉风行方能破局。",
    ],
  },
  {
    match: /idealist|virtue|legitimacy|moral/i,
    stance: "支持",
    lines: [
      "此事合乎道义，正是彰显圣德之机。",
      "顺民心、合礼法，理应推行，臣愿附议。",
    ],
  },
];

const FALLBACK = [
  "臣以为此事尚需细察，方好定论。",
  "议题重大，愿闻众卿高见。",
];

export function mockLLM(prompt: string): string {
  const tpl = TEMPLATES.find((t) => t.match.test(prompt));
  const pickFrom = <T,>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)] as T;

  if (!tpl) {
    return `【中立】${pickFrom(FALLBACK)}`;
  }
  return `【${tpl.stance}】${pickFrom(tpl.lines)}`;
}
