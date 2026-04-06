export const ITEMS_PER_PAGE = 21;
export const COLLECTIONS_PER_PAGE = 21;
export const DASHBOARD_COLLECTIONS_LIMIT = 6;
export const DASHBOARD_RECENT_ITEMS_LIMIT = 10;

export function parsePage(value: string | undefined): number {
  const n = parseInt(value ?? '1', 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

export function pageCount(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / perPage));
}
