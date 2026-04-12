'use server'

import { z } from 'zod'
import { requireAuth } from '@/lib/auth-utils'
import { parseInput } from '@/lib/action-utils'
import { prisma } from '@/lib/prisma'
import { DEFAULT_EDITOR_PREFERENCES } from '@/types/editor'
import type { EditorPreferences } from '@/types/editor'
import type { MutateResult } from '@/types/actions'

const EditorPreferencesSchema = z.object({
  fontSize: z.number().int().min(10).max(24),
  tabSize: z.number().int().min(2).max(8),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(['vs-dark', 'monokai', 'github-dark']),
})

export async function updateEditorPreferences(input: EditorPreferences): Promise<MutateResult> {
  const user = await requireAuth()
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = parseInput(EditorPreferencesSchema, input)
  if ('error' in parsed) return { success: false, error: parsed.error }

  await prisma.user.update({
    where: { id: user.userId },
    data: { editorPreferences: parsed.data },
  })

  return { success: true }
}

export async function getEditorPreferences(): Promise<EditorPreferences> {
  const user = await requireAuth()
  if (!user) return DEFAULT_EDITOR_PREFERENCES

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { editorPreferences: true },
  })

  if (!dbUser?.editorPreferences) return DEFAULT_EDITOR_PREFERENCES

  const parsed = EditorPreferencesSchema.safeParse(dbUser.editorPreferences)
  return parsed.success ? parsed.data : DEFAULT_EDITOR_PREFERENCES
}
