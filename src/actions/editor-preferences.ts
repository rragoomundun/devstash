'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_EDITOR_PREFERENCES } from '@/types/editor'
import type { EditorPreferences } from '@/types/editor'

const EditorPreferencesSchema = z.object({
  fontSize: z.number().int().min(10).max(24),
  tabSize: z.number().int().min(2).max(8),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(['vs-dark', 'monokai', 'github-dark']),
})

type Result = { success: true } | { success: false; error: string }

export async function updateEditorPreferences(input: EditorPreferences): Promise<Result> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  const parsed = EditorPreferencesSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { editorPreferences: parsed.data },
  })

  return { success: true }
}

export async function getEditorPreferences(): Promise<EditorPreferences> {
  const session = await auth()
  if (!session?.user?.id) return DEFAULT_EDITOR_PREFERENCES

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { editorPreferences: true },
  })

  if (!user?.editorPreferences) return DEFAULT_EDITOR_PREFERENCES

  const parsed = EditorPreferencesSchema.safeParse(user.editorPreferences)
  return parsed.success ? parsed.data : DEFAULT_EDITOR_PREFERENCES
}
