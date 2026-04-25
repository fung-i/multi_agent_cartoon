import type { Stance } from "@theatre/core";

const SUPPORT = /【?\s*(支持|赞同|赞成|support|agree)\s*】?/i;
const OPPOSE = /【?\s*(反对|不赞成|否决|oppose|against|disagree)\s*】?/i;
const NEUTRAL = /【?\s*(中立|保留|观望|neutral)\s*】?/i;

/**
 * Best-effort stance extraction for MVP. Expects the agent prompt to nudge
 * the model into emitting a leading tag like【支持】/【反对】/【中立】.
 */
export function extractStance(text: string): Stance {
  if (SUPPORT.test(text)) return "support";
  if (OPPOSE.test(text)) return "oppose";
  if (NEUTRAL.test(text)) return "neutral";
  return "neutral";
}
