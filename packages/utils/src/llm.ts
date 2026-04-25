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
export async function callLLMWithMeta(prompt: string): Promise<LLMResult> {
  const model = getModel();

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
      temperature: 0.8,
      max_tokens: 160,
      messages: [
        {
          role: "system",
          content:
            "你是一个参与朝堂议政的角色。请严格扮演用户给出的身份，用简短有力的中文发言（不超过 80 字），并在开头用【支持】【反对】或【中立】明确表态。",
        },
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
