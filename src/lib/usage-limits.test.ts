import { describe, it, expect } from 'vitest'
import {
  FREE_ITEM_LIMIT,
  FREE_COLLECTION_LIMIT,
  isOverItemLimit,
  isOverCollectionLimit,
} from './usage-limits'

describe('isOverItemLimit', () => {
  it('returns false when Pro regardless of count', () => {
    expect(isOverItemLimit(FREE_ITEM_LIMIT + 100, true)).toBe(false)
  })

  it('returns false when under the free item limit', () => {
    expect(isOverItemLimit(FREE_ITEM_LIMIT - 1, false)).toBe(false)
  })

  it('returns false at exactly the limit boundary (50 is the last allowed)', () => {
    expect(isOverItemLimit(FREE_ITEM_LIMIT, false)).toBe(false)
  })

  it('returns true when over the free item limit (51 items)', () => {
    expect(isOverItemLimit(FREE_ITEM_LIMIT + 1, false)).toBe(true)
  })
})

describe('isOverCollectionLimit', () => {
  it('returns false when Pro regardless of count', () => {
    expect(isOverCollectionLimit(FREE_COLLECTION_LIMIT + 100, true)).toBe(false)
  })

  it('returns false when under the free collection limit', () => {
    expect(isOverCollectionLimit(FREE_COLLECTION_LIMIT - 1, false)).toBe(false)
  })

  it('returns true when at the limit (3 collections, free tier is full)', () => {
    expect(isOverCollectionLimit(FREE_COLLECTION_LIMIT, false)).toBe(true)
  })

  it('returns true when over the free collection limit (4 collections)', () => {
    expect(isOverCollectionLimit(FREE_COLLECTION_LIMIT + 1, false)).toBe(true)
  })
})
