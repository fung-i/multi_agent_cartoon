# AI Agent Theatre

一个多智能体、事件驱动的“辩论剧场”。用户提交一个话题后，多个具备不同角色的
Agent（可以理解为“小型议事会”）会依次发言、投票，并给出最终结论。整个过程会以
带类型的事件流形式实时推送到前端界面。

- 流式传输：**SSE**（`text/event-stream`）
- 编排器：每次 `yield` 一个事件的 **Async Generator**
- 共享事件 schema：`packages/core`

## 项目结构

```
apps/web                  Next.js 14 App Router 应用（含 /api/stream SSE 路由）
packages/core             事件类型定义
packages/agents           Agent 列表 + 提示词构建
packages/utils            LLM 客户端（OpenAI + mock 回退）
packages/orchestrator     runDebate 异步生成器
```

## 快速开始

```bash
pnpm install
cp .env.example .env.local     # 可选：配置模型服务提供方
# Next.js 只会从应用目录读取 env 文件，因此需要把根目录的 .env.local
# 链接到 apps/web，让两处共用同一份配置：
ln -s ../../.env.local apps/web/.env.local   # （本仓库通常已预设）
pnpm dev
```

打开 http://localhost:3000，输入话题后即可观看完整辩论流程。

如果没有配置 API Key，系统会自动回退到可复现的 mock LLM，
因此 Demo 依然可以端到端运行。

## 选择 LLM 提供方

任何兼容 OpenAI API 的端点都可以使用。在 `.env.local` 中设置以下三项：

```bash
LLM_BASE_URL=...   # 留空则默认使用 OpenAI
LLM_API_KEY=...
LLM_MODEL=...
```

`.env.example` 中提供了可直接参考的配置片段，包括 DeepSeek、Qwen（DashScope）、
豆包（Volcengine Ark）、Kimi、GLM、Gemini（OpenAI 兼容端点）、
OpenRouter、SiliconFlow 等。为兼容旧配置，`OPENAI_API_KEY` / `OPENAI_MODEL`
也仍然生效。

## 常用脚本

```bash
pnpm dev                    # 启动 Next.js 应用
pnpm demo:orchestrator      # 在终端打印完整事件流
pnpm typecheck              # 对所有 package 做类型检查
pnpm build                  # 构建所有 package + web 应用
```
