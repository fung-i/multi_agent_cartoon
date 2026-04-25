/**
 * Local mock: mirrors the 摘要 + 正文 structure expected by
 * {@link parseStructuredSpeech} so offline runs look like the real thing.
 */
const TEMPLATES: Array<{
  match: RegExp;
  stance: "支持" | "反对" | "中立";
  summary: string;
  body: string;
}> = [
  {
    match: /policy_drafter|中书|拟旨/i,
    stance: "中立",
    summary: "条陈可行要点，分步落实施行。",
    body:
      "就题意先列前提与可量化目标，次列执行节点与主责，附风险与回退。以上作为中书拟案之骨架，可再就细节廷议。",
  },
  {
    match: /reviewer|门下|封驳/i,
    stance: "支持",
    summary: "草案大体可行，须补两处分险说明。",
    body:
      "对中书所拟，臣以为方向可取，唯「经费来源」与「民怨舆情」两节尚薄，应令中书补一稿再颁行，以免落地生变。在补正前，臣对主干方案示支持，以便继续打磨。",
  },
  {
    match: /conservative|stability|吏|守成/i,
    stance: "反对",
    summary: "事体重大，未稳莫轻动祖制。",
    body:
      "轻举妄动恐伤根本，祖制与吏考牵一发而动全身。若行此策，须先明三年考绩与员额来源，否则臣不敢从。",
  },
  {
    match: /rational|cost control|fiscal|户|算计/i,
    stance: "中立",
    summary: "先核清账目与岁入再议，否则难批。",
    body:
      "库银与常赋须一笔一笔算实；若加税，须对商户分层试算。账目清楚、现金流可持继，方敢附议。",
  },
  {
    match: /aggressive|decisive|bold|兵|果决/i,
    stance: "支持",
    summary: "机不可失，当断则断。",
    body:
      "时局不待人，文牍往来徒误战机。在底线护栏齐备前提下，当雷厉推行，以振纲纪。",
  },
  {
    match: /idealist|virtue|legitimacy|moral|礼|崇德/i,
    stance: "支持",
    summary: "合礼顺民则可行，以彰圣化。",
    body:
      "使政令不悖礼法、不伤庶望，使百姓晓喻而上悦下安，此策即值得一试。",
  },
  {
    match: /legal|刑|折狱/i,
    stance: "中立",
    summary: "须与现律不冲突、裁量有据。",
    body:
      "新令若出，当同步修订适用条文与罚则边界，并给司吏培训口径，使上下同轨、民知所避。",
  },
  {
    match: /engineer|practical|工|营造/i,
    stance: "中立",
    summary: "工程与工料、工期要写得可验收。",
    body:
      "务请写明里程碑、可验收的量化指标，以及物料与徭役摊派，防半途停工。",
  },
];

const FALLBACK: {
  stance: "支持" | "反对" | "中立";
  summary: string;
  body: string;
} = {
  stance: "中立",
  summary: "议题体大，需再观廷议。",
  body: "众议纷陈，容臣再与各部详核，不敢妄下断语。",
};

function format(stance: string, summary: string, body: string): string {
  return `【${stance}】\n【摘要】${summary}\n【正文】${body}`;
}

export function mockLLM(prompt: string): string {
  const tpl = TEMPLATES.find((t) => t.match.test(prompt));
  if (!tpl) {
    return format(FALLBACK.stance, FALLBACK.summary, FALLBACK.body);
  }
  return format(tpl.stance, tpl.summary, tpl.body);
}
