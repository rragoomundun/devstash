'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { updateItem as dbUpdateItem } from '@/lib/db/items'
import type { ItemDetail } from '@/lib/db/items'
import { UpdateItemSchema } from '@/lib/schemas/items'

type UpdateItemInput = z.input<typeof UpdateItemSchema>

type ActionResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string }

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
    const item = await dbUpdateItem(session.user.id, itemId, parsed.data)
    return { success: true, data: item }
  } catch {
    return { success: false, error: 'Failed to save changes' }
  }
}
