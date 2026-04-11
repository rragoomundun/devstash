# AI Integration Plan

> Research compiled 2026-04-11. Covers OpenAI SDK setup, server action patterns, streaming, error handling, rate limiting, Pro gating, cost optimisation, UI patterns, and security.

---

## 1. OpenAI SDK Setup

### Installation

```bash
npm install openai
```

### Singleton (mirrors `src/lib/stripe.ts`)

```ts
// src/lib/openai.ts
import OpenAI from 'openai'

let _openai: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 2,       // automatic exponential-backoff retries
      timeout: 30_000,     // 30 s per request
    })
  }
  return _openai
}
```

- `OPENAI_API_KEY` is server-only — never expose it to the client or add it to `NEXT_PUBLIC_*`.
- The SDK retries on transient errors (5xx, connection failures) automatically. `maxRetries: 2` keeps latency bounded.
- `timeout: 30_000` prevents hung requests from blocking a serverless function until its max execution time.

---

## 2. Model

All AI features use **`gpt-4o-mini`** (project spec calls it `gpt-5-nano` — map this to whatever the actual model ID is at launch). `gpt-4o-mini` is the natural current stand-in: fast, cheap, capable enough for tagging/summarisation/explanation.

Set the model ID in one place:

```ts
// src/lib/openai.ts
export const AI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
```

---

## 3. Server Action Pattern

All AI features follow the same pattern as `src/actions/items.ts`:

```ts
'use server'

import { auth } from '@/auth'
import { getOpenAI, AI_MODEL } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

type AiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

**Auth + Pro gate** in every action:

```ts
const session = await auth()
if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { isPro: true },
})
if (!user?.isPro) return { success: false, error: 'Pro required' }
```

This mirrors the existing `isOverItemLimit` / `isOverCollectionLimit` gating pattern — the check lives server-side in the action, not just in the UI.

---

## 4. Feature Implementations

### 4.1 Auto-Tag

Returns up to 5 tag suggestions for an item. Uses **structured output** via `zodResponseFormat` so the response is always a typed array — no manual JSON parsing.

```ts
// src/actions/ai.ts
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

const TagsSchema = z.object({
  tags: z.array(z.string().max(30)).max(5),
})

export async function autoTagItem(itemId: string): Promise<AiResult<string[]>> {
  // auth + pro gate ...

  const item = await prisma.item.findUnique({
    where: { id: itemId, userId: session.user.id },
    select: { title: true, description: true, content: true },
  })
  if (!item) return { success: false, error: 'Item not found' }

  const text = [item.title, item.description, item.content]
    .filter(Boolean)
    .join('\n')
    .slice(0, 2000) // cap input tokens

  try {
    const completion = await getOpenAI().beta.chat.completions.parse({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a developer knowledge base assistant. Suggest up to 5 concise, lowercase tags for the given content. Tags should be single words or short hyphenated phrases.',
        },
        { role: 'user', content: text },
      ],
      response_format: zodResponseFormat(TagsSchema, 'tags'),
      max_tokens: 100,
    })
    const parsed = completion.choices[0]?.message.parsed
    return parsed
      ? { success: true, data: parsed.tags }
      : { success: false, error: 'No response from AI' }
  } catch (err) {
    return { success: false, error: formatAiError(err) }
  }
}
```

### 4.2 AI Summary

Returns a 1–3 sentence plain-text summary.

```ts
export async function summarizeItem(itemId: string): Promise<AiResult<string>> {
  // auth + pro gate + fetch item ...

  const completion = await getOpenAI().chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'Summarize the following developer resource in 1–3 sentences. Be concise and technical.',
      },
      { role: 'user', content: text.slice(0, 3000) },
    ],
    max_tokens: 150,
  })

  const summary = completion.choices[0]?.message.content?.trim()
  return summary
    ? { success: true, data: summary }
    : { success: false, error: 'No response from AI' }
}
```

### 4.3 Code Explanation

Plain-language explanation of a code snippet. Only applicable to items with `contentType === 'TEXT'` and a `language` set.

```ts
export async function explainCode(itemId: string): Promise<AiResult<string>> {
  // auth + pro gate ...
  // item must have content and language field

  const completion = await getOpenAI().chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert ${item.language} developer. Explain the following code in plain English. Describe what it does, why it would be used, and any notable patterns or caveats.`,
      },
      { role: 'user', content: item.content.slice(0, 4000) },
    ],
    max_tokens: 400,
  })
  // ...
}
```

### 4.4 Prompt Optimizer

Rewrites an AI prompt for better results. Only for items with `itemType.name === 'Prompt'`.

```ts
export async function optimizePrompt(itemId: string): Promise<AiResult<string>> {
  // auth + pro gate ...

  const completion = await getOpenAI().chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an expert prompt engineer. Rewrite the given prompt to be clearer, more specific, and more likely to produce high-quality AI output. Return only the improved prompt, no explanation.',
      },
      { role: 'user', content: item.content.slice(0, 2000) },
    ],
    max_tokens: 500,
  })
  // ...
}
```

---

## 5. Streaming vs Non-Streaming

| Feature          | Recommendation     | Reason                                               |
| ---------------- | ------------------ | ---------------------------------------------------- |
| Auto-tag         | **Non-streaming**  | Short output, structured JSON; streaming adds no UX benefit |
| Summary          | **Non-streaming**  | Short text (< 150 tokens); fast enough to return whole |
| Code explanation | **Streaming**      | Potentially 400 tokens; streaming improves perceived speed |
| Prompt optimizer | **Streaming**      | Up to 500 tokens; user benefits from seeing it build |

### Streaming via API Route (not Server Actions)

Server Actions cannot stream incrementally to the client. For features where streaming matters (code explanation, prompt optimizer), use a **Route Handler** returning a `ReadableStream`, and consume it client-side with `fetch` + `response.body.getReader()` or the Vercel AI SDK `useChat`/`useCompletion`.

```ts
// src/app/api/ai/explain/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getOpenAI, AI_MODEL } from '@/lib/openai'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // pro gate ...

  const { itemId } = await req.json()
  // fetch item, validate ownership ...

  const stream = await getOpenAI().chat.completions.create({
    model: AI_MODEL,
    messages: [...],
    stream: true,
    max_tokens: 400,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

For non-streaming features (auto-tag, summary), **Server Actions are preferred** — they're simpler and already used throughout the codebase.

---

## 6. Error Handling

The SDK exports typed error classes. Centralise handling in a helper:

```ts
// src/lib/openai.ts
import { OpenAI } from 'openai'

export function formatAiError(err: unknown): string {
  if (err instanceof OpenAI.RateLimitError) {
    return 'AI service is busy, please try again in a moment.'
  }
  if (err instanceof OpenAI.AuthenticationError) {
    return 'AI service configuration error.'
  }
  if (err instanceof OpenAI.APIConnectionError) {
    return 'Could not reach AI service. Check your connection.'
  }
  if (err instanceof OpenAI.BadRequestError) {
    return 'Invalid request to AI service.'
  }
  // InternalServerError, UnprocessableEntityError, etc.
  return 'AI request failed. Please try again.'
}
```

Never surface the raw OpenAI error message to the client — it may contain prompt content or internal details.

---

## 7. Rate Limiting

Reuse the existing `src/lib/rate-limit.ts` pattern (Upstash Redis sliding window):

```ts
// Per-user limit: 20 AI calls per hour
const aiLimiter = ratelimit('ai', 20, '1 h')

// In each action, before the OpenAI call:
const { success: allowed } = await aiLimiter(`ai:${session.user.id}`)
if (!allowed) return { success: false, error: 'AI rate limit reached. Try again in an hour.' }
```

This guards against a single user exhausting the OpenAI quota. The limiter should be per-user (not per-IP) since all AI features are Pro-only and therefore authenticated.

---

## 8. Pro User Gating

Gating lives in **two places** — both are required:

| Layer | Mechanism | Purpose |
| --- | --- | --- |
| Server action / API route | `user.isPro` DB check | Authoritative enforcement |
| Client (ItemDrawer, context) | `isPro` from `useItems()` / session | Hide buttons, show upgrade prompt |

Client-side example (ItemDrawer action bar):

```tsx
{isPro ? (
  <Button onClick={handleAutoTag}>Auto-Tag</Button>
) : (
  <Button variant="ghost" asChild>
    <Link href="/upgrade">✨ Auto-Tag (Pro)</Link>
  </Button>
)}
```

`isPro` is already available in `ItemsContext` and `session.user.isPro` (added in Stripe Phase 1).

---

## 9. Cost Optimisation

| Strategy | Implementation |
|---|---|
| **Cap input tokens** | Slice content before sending: `.slice(0, N)` — see per-feature limits above |
| **`max_tokens`** | Always set — prevents runaway completions |
| **Short system prompts** | Keep system messages under 100 tokens |
| **Cache summaries/tags** | Store AI output in `Item` fields (`aiSummary String?`, `aiTags String[]`) so re-running costs zero |
| **`gpt-4o-mini`** | ~15× cheaper than GPT-4o for the same throughput |
| **Only call on demand** | Never auto-run AI on item create/save; always user-initiated |

### Suggested schema additions (future migration)

```prisma
model Item {
  // ...existing fields...
  aiSummary   String?   // cached AI summary
  aiTags      String[]  // cached AI-suggested tags
  aiUpdatedAt DateTime? // when the cache was last refreshed
}
```

---

## 10. UI Patterns

### Loading state

Use a local `isPending` boolean with `useTransition` (Server Actions) or `useState` (streaming fetch):

```tsx
const [isPending, startTransition] = useTransition()

function handleAutoTag() {
  startTransition(async () => {
    const result = await autoTagItem(item.id)
    if (result.success) setSuggestedTags(result.data)
    else toast.error(result.error)
  })
}

// In JSX:
<Button onClick={handleAutoTag} disabled={isPending}>
  {isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
  Auto-Tag
</Button>
```

### Accept / Reject suggestions

AI-suggested tags should be **additive proposals**, not automatically applied:

```tsx
// Show a chip list below the existing tags
{suggestedTags.length > 0 && (
  <div className="flex flex-wrap gap-1 mt-2">
    <span className="text-xs text-muted-foreground">AI suggests:</span>
    {suggestedTags.map(tag => (
      <button key={tag} onClick={() => addTag(tag)}
        className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/40">
        + {tag}
      </button>
    ))}
    <button onClick={() => setSuggestedTags([])} className="text-xs text-muted-foreground">Dismiss</button>
  </div>
)}
```

### Streaming text

For code explanation / prompt optimizer, accumulate streamed chunks into state:

```tsx
const [explanation, setExplanation] = useState('')
const [streaming, setStreaming] = useState(false)

async function handleExplain() {
  setStreaming(true)
  setExplanation('')
  const res = await fetch('/api/ai/explain', {
    method: 'POST',
    body: JSON.stringify({ itemId: item.id }),
  })
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    setExplanation(prev => prev + decoder.decode(value))
  }
  setStreaming(false)
}
```

Render with `<MarkdownEditor>` in read-only/preview mode so the output is nicely formatted.

---

## 11. Security

| Concern | Mitigation |
|---|---|
| API key exposure | `OPENAI_API_KEY` in `.env.local` only; never `NEXT_PUBLIC_*`; never returned in API responses |
| Prompt injection | Content sent to OpenAI is always in the `user` role, not interpolated into the `system` prompt; strip control chars if needed |
| Indirect prompt injection | Never trust AI output as executable instructions; always render as plain text or Markdown |
| Input size / cost abuse | Slice inputs before sending (see §9); enforce per-user rate limit (see §7) |
| Ownership validation | Always fetch item with `where: { id, userId: session.user.id }` before sending content to OpenAI |
| Pro gate bypass | Gate is enforced server-side in the action/route, independent of client state |

---

## 12. File Structure

```
src/
  lib/
    openai.ts              # singleton + AI_MODEL + formatAiError
  actions/
    ai.ts                  # autoTagItem, summarizeItem (non-streaming Server Actions)
  app/
    api/
      ai/
        explain/route.ts   # POST — streaming code explanation
        optimize/route.ts  # POST — streaming prompt optimizer
  components/
    dashboard/
      AiActions.tsx        # AI button group in ItemDrawer action bar
```

---

## 13. Implementation Order

1. `src/lib/openai.ts` — singleton, model constant, error formatter
2. `src/actions/ai.ts` — `autoTagItem` + `summarizeItem` (non-streaming, simpler to build and test)
3. `src/app/api/ai/explain/route.ts` — streaming explanation
4. `src/app/api/ai/optimize/route.ts` — streaming prompt optimizer
5. `AiActions.tsx` — shared UI component wired to all four features
6. Integrate `AiActions` into `ItemDrawer` action bar behind `isPro` gate
7. Unit tests for `autoTagItem` / `summarizeItem` (mock `getOpenAI()`)
