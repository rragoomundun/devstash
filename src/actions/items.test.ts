import { describe, it, expect } from 'vitest'
import { UpdateItemSchema } from '@/lib/schemas/items'

const validBase = {
  title: 'My snippet',
  description: null,
  content: null,
  url: null,
  language: null,
  tags: [],
}

describe('UpdateItemSchema', () => {
  it('accepts a valid minimal payload', () => {
    const result = UpdateItemSchema.safeParse(validBase)
    expect(result.success).toBe(true)
  })

  it('accepts a fully populated payload', () => {
    const result = UpdateItemSchema.safeParse({
      title: 'My snippet',
      description: 'A description',
      content: 'const x = 1',
      url: null,
      language: 'typescript',
      tags: ['react', 'hooks'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tags).toEqual(['react', 'hooks'])
    }
  })

  it('rejects an empty title', () => {
    const result = UpdateItemSchema.safeParse({ ...validBase, title: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/required/i)
    }
  })

  it('trims whitespace-only title to empty and rejects it', () => {
    const result = UpdateItemSchema.safeParse({ ...validBase, title: '   ' })
    expect(result.success).toBe(false)
  })

  it('trims whitespace from title', () => {
    const result = UpdateItemSchema.safeParse({ ...validBase, title: '  hello  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('hello')
    }
  })

  it('rejects an invalid URL', () => {
    const result = UpdateItemSchema.safeParse({ ...validBase, url: 'not-a-url' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/valid URL/i)
    }
  })

  it('accepts a valid URL', () => {
    const result = UpdateItemSchema.safeParse({ ...validBase, url: 'https://example.com' })
    expect(result.success).toBe(true)
  })

  it('coerces undefined optional fields to null', () => {
    const result = UpdateItemSchema.safeParse({ title: 'Test' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
      expect(result.data.content).toBeNull()
      expect(result.data.url).toBeNull()
      expect(result.data.language).toBeNull()
      expect(result.data.tags).toEqual([])
    }
  })

  it('filters blank entries out of tags array', () => {
    // Tags are pre-split by the client — empty strings are filtered before the action is called,
    // but the schema itself rejects tags with min(1) so we verify that constraint
    const result = UpdateItemSchema.safeParse({ ...validBase, tags: ['react', ''] })
    expect(result.success).toBe(false)
  })
})
