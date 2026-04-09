export const FREE_ITEM_LIMIT = 50
export const FREE_COLLECTION_LIMIT = 3

export function isOverItemLimit(count: number, isPro: boolean): boolean {
  if (isPro) return false
  return count > FREE_ITEM_LIMIT
}

export function isOverCollectionLimit(count: number, isPro: boolean): boolean {
  if (isPro) return false
  return count > FREE_COLLECTION_LIMIT
}
