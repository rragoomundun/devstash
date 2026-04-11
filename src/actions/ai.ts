'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { getOpenAI, AI_MODEL } from '@/lib/openai'
import { rateLimit, AI_LIMITS } from '@/lib/rate-limit'

const GenerateAutoTagsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
})

export type GenerateAutoTagsInput = z.input<typeof GenerateAutoTagsSchema>

type AutoTagResult =
  | { success: true; tags: string[] }
  | { success: false; error: string }

export async function generateAutoTags(input: GenerateAutoTagsInput): Promise<AutoTagResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!session.user.isPro) {
    return { success: false, error: 'AI features require a Pro subscription' }
  }

  const parsed = GenerateAutoTagsSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return { success: false, error: message }
  }

  const rl = await rateLimit(AI_LIMITS.autoTag, session.user.id)
  if (!rl.success) {
    const minutes = Math.ceil(rl.resetInSeconds / 60)
    return {
      success: false,
      error: `Too many AI requests. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
    }
  }

  const { title, content } = parsed.data
  const truncatedContent = content ? content.slice(0, 2000) : ''

  try {
    const openai = getOpenAI()
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        'You are a developer tool assistant that suggests relevant tags for developer resources. Return only a JSON object with a "tags" array of 3-5 lowercase tag strings. No explanation, just JSON.',
      input: `Suggest 3-5 tags for this developer item.\nTitle: ${title}${truncatedContent ? `\nContent: ${truncatedContent}` : ''}`,
      text: {
        format: { type: 'json_object' },
      },
    })

    const text = response.output_text
    const json: unknown = JSON.parse(text)

    // Handle both {"tags": [...]} and [...] formats
    const rawTags: unknown = Array.isArray(json) ? json : (json as Record<string, unknown>).tags

    if (!Array.isArray(rawTags)) {
      return { success: false, error: 'Failed to parse AI response' }
    }

    const tags = rawTags
      .filter((t): t is string => typeof t === 'string')
      .map(t => t.toLowerCase().trim())
      .filter(Boolean)
      .slice(0, 5)

    return { success: true, tags }
  } catch {
    return { success: false, error: 'AI service unavailable. Please try again.' }
  }
}
