# AI Agent Theatre 项目实现文档（MVP版本）

## 一、项目目标

构建一个**多 Agent 实时交互系统（AI剧场）**，支持：

* 用户输入一个问题（议题）
* 多个 Agent（如三省六部 / 议会成员）围绕该问题进行讨论
* 系统以**事件流（event stream）形式实时输出**
* 前端将事件流渲染为**可视化互动剧场（轻动画）**

---

## 二、核心设计理念（必须遵守）

### 1. Event-driven（最重要）

系统的唯一输出是**事件流（Event Stream）**，而不是直接文本结果。

👉 前端只消费事件，不参与逻辑。

---

### 2. Agent ≠ ChatGPT

每个 agent 必须有：

* role（角色）
* bias（立场）
* personality（性格）
* authority（权重）

---

### 3. Orchestrator 控制一切

* agent 不直接互相调用
* 所有行为由 orchestrator 调度

---

### 4. Streaming First

必须支持流式输出（SSE），不能等全部完成再返回。

---

## 三、技术栈

### 前端

* Next.js (App Router)
* TypeScript
* SSE（EventSource）
* 可选：Framer Motion（动画）

### 后端

* Node.js + TypeScript
* Express（或 Next API route）

### LLM

* OpenAI API（gpt-4o-mini）

---

## 四、项目结构（必须严格按照此结构）

```
ai-agent-theatre/
├── apps/
│   ├── web/                 # 前端（Next.js）
│   └── server/              # SSE服务
│
├── packages/
│   ├── core/                # 类型定义（Event）
│   ├── agents/              # agent定义
│   ├── orchestrator/        # 调度逻辑
│   └── utils/               # LLM封装
```

---

## 五、核心模块说明

---

# 1. packages/core（事件系统）

## 目标

定义统一的 Event Schema（所有模块必须使用）

## 必须实现：

```ts
type EventType =
  | "scene.init"
  | "agent.think"
  | "agent.speak"
  | "agent.interrupt"
  | "vote"
  | "decision.final"
```

```ts
type BaseEvent = {
  id: string
  timestamp: number
  round: number
  type: EventType
  agentId?: string
}
```

---

## 关键事件

### agent.speak（最重要）

```ts
{
  type: "agent.speak",
  agentId: string,
  content: string,
  stance: "support" | "oppose" | "neutral"
}
```

---

# 2. packages/agents（角色定义）

## 目标

定义固定 Agent（MVP 不支持用户自定义）

## 示例（三省六部）

```ts
export const agents = [
  {
    id: "libu",
    name: "吏部",
    personality: "conservative",
    bias: "stability first"
  },
  {
    id: "hubu",
    name: "户部",
    personality: "rational",
    bias: "cost control"
  }
]
```

---

## Prompt 构建函数（必须有）

```ts
buildPrompt(agent, context)
```

要求：

* 明确角色身份
* 强调 bias
* 输出简短内容（适合流式）

---

# 3. packages/utils（LLM调用）

## 必须实现：

```ts
async function callLLM(prompt: string): Promise<string>
```

要求：

* 使用 OpenAI API
* 返回文本内容
* 不要做复杂封装（MVP保持简单）

---

# 4. packages/orchestrator（核心）

## 目标

实现多 Agent 调度（最重要模块）

---

## 必须实现：

```ts
async function* runDebate(topic: string)
```

👉 返回：Async Generator（逐条 yield event）

---

## 基本流程（严格按此实现）

### Step 1：初始化

```ts
yield scene.init
```

---

### Step 2：逐个 agent 发言

循环 agents：

```ts
yield agent.think
call LLM
yield agent.speak
```

---

### Step 3：投票

```ts
yield vote
```

---

### Step 4：最终结论

```ts
yield decision.final
```

---

## 注意事项

* 必须使用 `for await` 流式输出
* 不允许一次性返回数组
* 每个 agent 至少发言一次

---

# 5. apps/server（SSE服务）

## 目标

将 orchestrator 输出转为 SSE 流

---

## 必须实现接口：

```
GET /stream?topic=xxx
```

---

## 行为：

```ts
for await (event of runDebate(topic)) {
  res.write(`data: ${JSON.stringify(event)}\n\n`)
}
```

---

## 必须设置 header：

```ts
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

---

# 6. apps/web（前端）

---

## 1. Event Stream Hook

```ts
useEventStream(topic)
```

功能：

* 创建 EventSource
* 实时接收事件
* 存入 state

---

## 2. 页面结构

```tsx
<Home>
  <Scene />
  <AgentList />
  <EventFeed />
</Home>
```

---

## 3. EventRenderer（核心）

根据 event.type 渲染：

| type           | UI   |
| -------------- | ---- |
| agent.speak    | 发言气泡 |
| vote           | 投票结果 |
| decision.final | 最终结论 |

---

## 4. UI要求（MVP）

必须实现：

* 当前发言人高亮
* 文本流式展示
* 简单列表即可（不要复杂UI）

---

## 禁止事项：

* ❌ 不要做3D
* ❌ 不要复杂动画
* ❌ 不要用户配置系统

---

## 六、数据流（必须理解）

```
用户输入
   ↓
Next.js
   ↓
SSE 请求
   ↓
Server
   ↓
Orchestrator
   ↓
LLM
   ↓
Event Stream
   ↓
前端渲染
```

---

## 七、MVP验收标准（必须满足）

### 功能

* ✅ 输入问题
* ✅ 至少3个agent参与
* ✅ 每个agent发言
* ✅ 有投票
* ✅ 有最终结论

---

### 技术

* ✅ 使用SSE
* ✅ 使用Async Generator
* ✅ 使用统一Event Schema

---

### 体验

* ✅ 可以“看到过程”
* ❌ 不能只是最终答案

---

## 八、后续扩展（当前不实现）

* 多轮辩论
* agent interrupt
* 权力权重系统
* 情绪系统
* 可视化关系图
* 用户自定义 agent

---

## 九、开发优先级（严格顺序）

1. core（类型）
2. orchestrator（能跑）
3. server（SSE）
4. web（基础渲染）
5. 优化体验

---

## 十、关键原则总结

> 这个项目不是聊天工具，而是一个：
>
> **“基于事件流的多Agent叙事系统”**

---

## 十一、最常见错误（必须避免）

* ❌ 把结果一次性返回（必须流式）
* ❌ agent没有差异（必须有bias）
* ❌ UI只显示文本（必须体现“谁在说话”）
* ❌ orchestrator只是for循环（后续需要扩展）

---

## 十二、最终目标（MVP）

实现一个可以：

👉 输入问题
👉 看AI“开会”
👉 实时看到争论过程
👉 最终得到一个决策

的系统

---

（文档结束）
