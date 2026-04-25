import { mockLLM } from "./mock";

export type LLMSource = "llm" | "mock";

export interface LLMInfo {
  /** "llm" when a real provider is configured; "mock" otherwise. */
  source: LLMSource;
  model: string;
  /** Only present when a custom OpenAI-compatible endpoint is used. */
  baseURL?: string;
}

export interface LLMResult {
  content: string;
  source: LLMSource;
  model: string;
  /** Populated when we fell back to mock because the upstream call failed. */
  fallbackReason?: string;
}

export interface CallLLMOptions {
  maxTokens?: number;
  systemMessage?: string;
}

function getApiKey(): string | undefined {
  return process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
}

function getBaseURL(): string | undefined {
  return process.env.LLM_BASE_URL || undefined;
}

function getModel(): string {
  return (
    process.env.LLM_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini"
  );
}

export function isMockMode(): boolean {
  return !getApiKey();
}

/**
 * Describe how the LLM is currently configured. Safe to call on boot or
 * per-request to surface the active provider in logs / UI.
 */
export function describeLLM(): LLMInfo {
  if (isMockMode()) {
    return { source: "mock", model: "mock" };
  }
  return {
    source: "llm",
    model: getModel(),
    baseURL: getBaseURL(),
  };
}

/**
 * Call the LLM and return both the content and the source it came from.
 * Works with any OpenAI-compatible endpoint via `LLM_BASE_URL`.
 */
export async function callLLMWithMeta(
  prompt: string,
  options: CallLLMOptions = {},
): Promise<LLMResult> {
  const model = getModel();
  const maxTokens = options.maxTokens ?? 500;
  const systemMessage =
    options.systemMessage ??
    `你是古代「中书省—门下省—六部」议事流程的参与者。除用户特别说明外，你的回复必须依序含：
1) 第一行，以【支持】【反对】或【中立】之一开头，表明对当前子任务要求的立场；
2) 新起一行，以【摘要】开头，接不超过 24 字的一行概括；
3) 新起一段，以【正文】开头，后接 1～3 段具体论述。`;

  if (isMockMode()) {
    return { content: mockLLM(prompt), source: "mock", model: "mock" };
  }

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({
      apiKey: getApiKey(),
      baseURL: getBaseURL(),
    });

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.7,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty completion");
    return { content, source: "llm", model };
  } catch (err) {
    const reason = (err as Error).message;
    console.warn("[callLLM] LLM call failed, falling back to mock:", reason);
    return {
      content: mockLLM(prompt),
      source: "mock",
      model: "mock",
      fallbackReason: reason,
    };
  }
}

/**
 * Legacy string-only wrapper around {@link callLLMWithMeta}. Kept so existing
 * callers that only need the text don't have to change.
 */
export async function callLLM(prompt: string): Promise<string> {
  const { content } = await callLLMWithMeta(prompt);
  return content;
}
