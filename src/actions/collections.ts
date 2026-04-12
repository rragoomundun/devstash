'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth-utils'
import { parseInput, withAction, withMutation } from '@/lib/action-utils'
import {
  createCollection as dbCreateCollection,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  toggleCollectionFavorite as dbToggleCollectionFavorite,
} from '@/lib/db/collections'
import { CreateCollectionSchema } from '@/lib/schemas/collections'
import type { ActionResult, MutateResult } from '@/types/actions'

type CreateCollectionInput = z.input<typeof CreateCollectionSchema>

function revalidateCollections() {
  revalidatePath('/', 'layout')
}

export async function createCollection(
  input: CreateCollectionInput,
): Promise<ActionResult<{ id: string; name: string; description: string | null }>> {
  const user = await requireAuth()
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = parseInput(CreateCollectionSchema, input)
  if ('error' in parsed) return { success: false, error: parsed.error }

  return withAction(async () => {
    const collection = await dbCreateCollection(user.userId, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    revalidateCollections()
    return collection
  }, 'Failed to create collection')
}

export async function updateCollection(
  collectionId: string,
  input: z.input<typeof CreateCollectionSchema>,
): Promise<MutateResult> {
  const user = await requireAuth()
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = parseInput(CreateCollectionSchema, input)
  if ('error' in parsed) return { success: false, error: parsed.error }

  return withMutation(async () => {
    await dbUpdateCollection(user.userId, collectionId, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    revalidateCollections()
  }, 'Failed to update collection')
}

export async function toggleCollectionFavorite(
  collectionId: string,
  isFavorite: boolean,
): Promise<MutateResult> {
  const user = await requireAuth()
  if (!user) return { success: false, error: 'Unauthorized' }
  return withMutation(async () => {
    await dbToggleCollectionFavorite(user.userId, collectionId, isFavorite)
    revalidateCollections()
  }, 'Failed to update favorite')
}

export async function deleteCollection(collectionId: string): Promise<MutateResult> {
  const user = await requireAuth()
  if (!user) return { success: false, error: 'Unauthorized' }
  return withMutation(async () => {
    await dbDeleteCollection(user.userId, collectionId)
    revalidateCollections()
  }, 'Failed to delete collection')
}
