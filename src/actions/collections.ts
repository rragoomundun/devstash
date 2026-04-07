'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import {
  createCollection as dbCreateCollection,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  toggleCollectionFavorite as dbToggleCollectionFavorite,
} from '@/lib/db/collections'
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
    revalidatePath('/', 'layout')
    return { success: true, data: collection }
  } catch {
    return { success: false, error: 'Failed to create collection' }
  }
}

type MutateResult =
  | { success: true }
  | { success: false; error: string }

export async function updateCollection(
  collectionId: string,
  input: z.input<typeof CreateCollectionSchema>,
): Promise<MutateResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  const parsed = CreateCollectionSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  try {
    await dbUpdateCollection(session.user.id, collectionId, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    revalidatePath('/', 'layout')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update collection' }
  }
}

export async function toggleCollectionFavorite(collectionId: string, isFavorite: boolean): Promise<MutateResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  try {
    await dbToggleCollectionFavorite(session.user.id, collectionId, isFavorite)
    revalidatePath('/', 'layout')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update favorite' }
  }
}

export async function deleteCollection(collectionId: string): Promise<MutateResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  try {
    await dbDeleteCollection(session.user.id, collectionId)
    revalidatePath('/', 'layout')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete collection' }
  }
}
