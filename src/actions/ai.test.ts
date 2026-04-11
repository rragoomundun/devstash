import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Schema extracted for isolated testing (mirrors the one in ai.ts)
const GenerateAutoTagsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
})

describe('GenerateAutoTagsSchema', () => {
  it('accepts a title with no content', () => {
    const result = GenerateAutoTagsSchema.safeParse({ title: 'My snippet' })
    expect(result.success).toBe(true)
  })

  it('accepts a title with content', () => {
    const result = GenerateAutoTagsSchema.safeParse({
      title: 'React hook',
      content: 'const [state, setState] = useState()',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty title', () => {
    const result = GenerateAutoTagsSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Title is required')
    }
  })

  it('rejects missing title', () => {
    const result = GenerateAutoTagsSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('allows undefined content', () => {
    const result = GenerateAutoTagsSchema.safeParse({ title: 'Test', content: undefined })
    expect(result.success).toBe(true)
  })
})

describe('AI tag normalization', () => {
  function normalizeTags(raw: unknown): string[] {
    const rawTags: unknown = Array.isArray(raw) ? raw : (raw as Record<string, unknown>).tags
    if (!Array.isArray(rawTags)) return []
    return rawTags
      .filter((t): t is string => typeof t === 'string')
      .map(t => t.toLowerCase().trim())
      .filter(Boolean)
      .slice(0, 5)
  }

  it('normalizes {"tags": [...]} format', () => {
    const result = normalizeTags({ tags: ['React', 'Hooks', 'TypeScript'] })
    expect(result).toEqual(['react', 'hooks', 'typescript'])
  })

  it('normalizes array format', () => {
    const result = normalizeTags(['React', 'Hooks'])
    expect(result).toEqual(['react', 'hooks'])
  })

  it('trims whitespace from tags', () => {
    const result = normalizeTags({ tags: ['  react  ', 'hooks '] })
    expect(result).toEqual(['react', 'hooks'])
  })

  it('filters out non-string entries', () => {
    const result = normalizeTags({ tags: ['react', 42, null, 'hooks'] })
    expect(result).toEqual(['react', 'hooks'])
  })

  it('caps output at 5 tags', () => {
    const result = normalizeTags({ tags: ['a', 'b', 'c', 'd', 'e', 'f'] })
    expect(result).toHaveLength(5)
  })

  it('returns empty array for unexpected format', () => {
    const result = normalizeTags({ unexpected: 'format' })
    expect(result).toEqual([])
  })
})
