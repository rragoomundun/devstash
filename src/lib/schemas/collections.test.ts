import { describe, it, expect } from 'vitest'
import { CreateCollectionSchema } from '@/lib/schemas/collections'

describe('CreateCollectionSchema', () => {
  it('accepts a valid name-only payload', () => {
    const result = CreateCollectionSchema.safeParse({ name: 'React Patterns' })
    expect(result.success).toBe(true)
  })

  it('accepts a fully populated payload', () => {
    const result = CreateCollectionSchema.safeParse({
      name: 'React Patterns',
      description: 'Useful hooks and component patterns',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('React Patterns')
      expect(result.data.description).toBe('Useful hooks and component patterns')
    }
  })

  it('rejects an empty name', () => {
    const result = CreateCollectionSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/required/i)
    }
  })

  it('rejects a whitespace-only name', () => {
    const result = CreateCollectionSchema.safeParse({ name: '   ' })
    expect(result.success).toBe(false)
  })

  it('trims whitespace from name', () => {
    const result = CreateCollectionSchema.safeParse({ name: '  My Collection  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('My Collection')
    }
  })

  it('coerces undefined description to null', () => {
    const result = CreateCollectionSchema.safeParse({ name: 'Test' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
    }
  })

  it('coerces empty string description to null', () => {
    const result = CreateCollectionSchema.safeParse({ name: 'Test', description: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
    }
  })

  it('coerces whitespace-only description to null', () => {
    const result = CreateCollectionSchema.safeParse({ name: 'Test', description: '   ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
    }
  })

  it('trims whitespace from description', () => {
    const result = CreateCollectionSchema.safeParse({
      name: 'Test',
      description: '  A description  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBe('A description')
    }
  })
})
