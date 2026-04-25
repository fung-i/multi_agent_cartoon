# AI Agent Theatre

A multi-agent, event-driven debate theatre. Users submit a topic; several
differentiated agents (think "三省六部" / a small council) each speak, vote and
produce a final decision. The whole process streams live to the UI as a
sequence of typed events.

- Stream transport: **SSE** (`text/event-stream`)
- Orchestrator: **Async Generator** that `yield`s one event at a time
- Shared event schema in `packages/core`

## Layout

```
apps/web                  Next.js 14 App Router app (+ /api/stream SSE route)
packages/core             Event type definitions
packages/agents           Agent roster + prompt builder
packages/utils            LLM client (OpenAI + mock fallback)
packages/orchestrator     runDebate async generator
```

## Quick start

```bash
pnpm install
cp .env.example .env.local     # optional: configure a provider
# Because Next.js only reads env files from its own directory, link the
# root-level .env.local into apps/web so both locations share one file:
ln -s ../../.env.local apps/web/.env.local   # (already set up in this repo)
pnpm dev
```

Open http://localhost:3000, type a topic and watch the debate unfold.

If no API key is configured the system automatically falls back to a
deterministic mock LLM so the demo still runs end-to-end.

## Choosing an LLM provider

Any OpenAI-compatible endpoint works. Set these three in `.env.local`:

```bash
LLM_BASE_URL=...   # leave unset to use OpenAI
LLM_API_KEY=...
LLM_MODEL=...
```

See `.env.example` for ready-to-use snippets for DeepSeek, Qwen (DashScope),
Doubao (Volcengine Ark), Kimi, GLM, Gemini (OpenAI-compat endpoint),
OpenRouter, SiliconFlow, etc. `OPENAI_API_KEY` / `OPENAI_MODEL` are still
honored for backward compatibility.

## Useful scripts

```bash
pnpm dev                    # run the Next.js app
pnpm demo:orchestrator      # print a full event stream to the terminal
pnpm typecheck              # type-check every package
pnpm build                  # build all packages + web app
```
