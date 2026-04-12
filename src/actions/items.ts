'use server'

import { z } from 'zod'
import { requireAuth } from '@/lib/auth-utils'
import { parseInput, withMutation } from '@/lib/action-utils'
import {
  updateItem as dbUpdateItem,
  deleteItem as dbDeleteItem,
  createItem as dbCreateItem,
  getItemFileUrl,
  toggleItemFavorite as dbToggleItemFavorite,
  toggleItemPin as dbToggleItemPin,
} from '@/lib/db/items'
import type { ItemDetail } from '@/lib/db/items'
import { UpdateItemSchema, CreateItemSchema } from '@/lib/schemas/items'
import { deleteFromR2, keyFromUrl } from '@/lib/r2'
import type { ActionResult, MutateResult } from '@/types/actions'

type UpdateItemInput = z.input<typeof UpdateItemSchema>
type CreateItemInput = z.input<typeof CreateItemSchema>

export async function updateItem(
  itemId: string,
  input: UpdateItemInput,
): Promise<ActionResult<ItemDetail>> {
  const user = await requireAuth()
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = parseInput(UpdateItemSchema, input)
  if ('error' in parsed) return { success: false, error: parsed.error }

  try {
    const item = await dbUpdateItem(user.userId, itemId, {
      title: parsed.data.title,
      description: parsed.data.description,
      content: parsed.data.content,
      url: parsed.data.url,
      language: parsed.data.language,
      tags: parsed.data.tags,
      collectionIds: parsed.data.collectionIds,
    })
    return { success: true, data: item }
  } catch {
    return { success: false, error: 'Failed to save changes' }
  }
}

export async function createItem(input: CreateItemInput): Promise<ActionResult<ItemDetail>> {
  const user = await requireAuth()
  if (!user) return { success: false, error: 'Unauthorized' }

  const parsed = parseInput(CreateItemSchema, input)
  if ('error' in parsed) return { success: false, error: parsed.error }

  try {
    const item = await dbCreateItem(user.userId, {
      title: parsed.data.title,
      description: parsed.data.description,
      content: parsed.data.content,
      url: parsed.data.url,
      language: parsed.data.language,
      fileUrl: parsed.data.fileUrl,
      fileName: parsed.data.fileName,
      fileSize: parsed.data.fileSize,
      itemTypeId: parsed.data.itemTypeId,
      tags: parsed.data.tags,
      collectionIds: parsed.data.collectionIds,
    })
    return { success: true, data: item }
  } catch {
    return { success: false, error: 'Failed to create item' }
  }
}

export async function toggleItemFavorite(
  itemId: string,
  isFavorite: boolean,
): Promise<MutateResult> {
  const user = await requireAuth()
  if (!user) return { success: false, error: 'Unauthorized' }
  return withMutation(
    () => dbToggleItemFavorite(user.userId, itemId, isFavorite),
    'Failed to update favorite',
  )
}

export async function toggleItemPin(itemId: string, isPinned: boolean): Promise<MutateResult> {
  const user = await requireAuth()
  if (!user) return { success: false, error: 'Unauthorized' }
  return withMutation(
    () => dbToggleItemPin(user.userId, itemId, isPinned),
    'Failed to update pin',
  )
}

export async function deleteItem(itemId: string): Promise<MutateResult> {
  const user = await requireAuth()
  if (!user) return { success: false, error: 'Unauthorized' }

  try {
    const fileUrl = await getItemFileUrl(user.userId, itemId)
    await dbDeleteItem(user.userId, itemId)
    if (fileUrl) {
      try {
        await deleteFromR2(keyFromUrl(fileUrl))
      } catch {
        // R2 cleanup failure is non-fatal — DB record is already deleted
      }
    }
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete item' }
  }
}
