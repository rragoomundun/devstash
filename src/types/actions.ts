export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type MutateResult = { success: true } | { success: false; error: string }
