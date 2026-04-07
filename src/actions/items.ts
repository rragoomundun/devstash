'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { updateItem as dbUpdateItem, deleteItem as dbDeleteItem, createItem as dbCreateItem, getItemFileUrl, toggleItemFavorite as dbToggleItemFavorite, toggleItemPin as dbToggleItemPin } from '@/lib/db/items'
import type { ItemDetail } from '@/lib/db/items'
import { UpdateItemSchema, CreateItemSchema } from '@/lib/schemas/items'
import { deleteFromR2, keyFromUrl } from '@/lib/r2'

type UpdateItemInput = z.input<typeof UpdateItemSchema>
type CreateItemInput = z.input<typeof CreateItemSchema>

type ActionResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string }

type DeleteResult = { success: true } | { success: false; error: string }

export async function updateItem(
  itemId: string,
  input: UpdateItemInput
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = UpdateItemSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return { success: false, error: message }
  }

  try {
    const item = await dbUpdateItem(session.user.id, itemId, {
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

export async function createItem(input: CreateItemInput): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = CreateItemSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return { success: false, error: message }
  }

  try {
    const item = await dbCreateItem(session.user.id, {
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

export async function toggleItemFavorite(itemId: string, isFavorite: boolean): Promise<DeleteResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  try {
    await dbToggleItemFavorite(session.user.id, itemId, isFavorite)
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update favorite' }
  }
}

export async function toggleItemPin(itemId: string, isPinned: boolean): Promise<DeleteResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  try {
    await dbToggleItemPin(session.user.id, itemId, isPinned)
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update pin' }
  }
}

export async function deleteItem(itemId: string): Promise<DeleteResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const fileUrl = await getItemFileUrl(session.user.id, itemId)
    await dbDeleteItem(session.user.id, itemId)
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
