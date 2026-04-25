import type { Stance } from "@theatre/core";
import { extractStance } from "./stance";

const STANCE_PREFIX = /^\s*【(支持|反对|中立|赞同|赞成)】\s*/m;

/**
 * Take raw LLM output and split stance + 摘要 (for UI preview) + 正文 (full text).
 * If 摘要/正文 are missing, falls back to a short auto-summary of the main body.
 */
export function parseStructuredSpeech(raw: string): {
  stance: Stance;
  summary: string;
  content: string;
} {
  const stance = extractStance(raw);
  const withoutStance = raw.replace(STANCE_PREFIX, "").trim();

  const sumLine = withoutStance.match(/【摘要】\s*([^\n【]+)/);
  const bodyAll = withoutStance.match(/【正文】\s*([\s\S]+)/);

  if (sumLine && bodyAll) {
    return {
      stance,
      summary: sumLine[1].replace(/\s+/g, " ").trim(),
      content: bodyAll[1].trim(),
    };
  }
  if (bodyAll) {
    const body = bodyAll[1].trim();
    const one = body.replace(/\s+/g, " ");
    const summary =
      one.length > 40 ? one.slice(0, 36).trim() + "…" : one;
    return { stance, summary, content: body };
  }
  if (sumLine) {
    const s = sumLine[1].replace(/\s+/g, " ").trim();
    return { stance, summary: s, content: s };
  }

  const body = withoutStance.replace(/【(摘要|正文)】/g, "").trim();
  if (!body) {
    return { stance, summary: "（无）", content: "" };
  }
  const oneLine = body.replace(/\s+/g, " ");
  const summary =
    oneLine.length > 40 ? oneLine.slice(0, 36).trim() + "…" : oneLine;
  return { stance, summary, content: body };
}
