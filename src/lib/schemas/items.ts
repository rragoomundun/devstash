import { z } from 'zod'

export const CreateItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().nullable().optional().transform(v => v ?? null),
  content: z.string().nullable().optional().transform(v => v ?? null),
  url: z.url('Must be a valid URL').nullable().optional().transform(v => v ?? null),
  language: z.string().trim().nullable().optional().transform(v => v ?? null),
  fileUrl: z.string().nullable().optional().transform(v => v ?? null),
  fileName: z.string().nullable().optional().transform(v => v ?? null),
  fileSize: z.number().int().nullable().optional().transform(v => v ?? null),
  itemTypeId: z.string().min(1, 'Item type is required'),
  tags: z.array(z.string().trim().min(1)).default([]),
})

export const UpdateItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().nullable().optional().transform(v => v ?? null),
  content: z.string().nullable().optional().transform(v => v ?? null),
  url: z.url('Must be a valid URL').nullable().optional().transform(v => v ?? null),
  language: z.string().trim().nullable().optional().transform(v => v ?? null),
  tags: z.array(z.string().trim().min(1)).default([]),
})
