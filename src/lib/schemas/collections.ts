import { z } from 'zod'

export const CreateCollectionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().nullable().optional().transform(v => v || null),
})
