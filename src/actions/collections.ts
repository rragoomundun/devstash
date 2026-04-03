'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { createCollection as dbCreateCollection } from '@/lib/db/collections'
import { CreateCollectionSchema } from '@/lib/schemas/collections'

type CreateCollectionInput = z.input<typeof CreateCollectionSchema>
type CreateResult =
  | { success: true; data: { id: string; name: string; description: string | null } }
  | { success: false; error: string }

export async function createCollection(input: CreateCollectionInput): Promise<CreateResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = CreateCollectionSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return { success: false, error: message }
  }

  try {
    const collection = await dbCreateCollection(session.user.id, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    return { success: true, data: collection }
  } catch {
    return { success: false, error: 'Failed to create collection' }
  }
}
