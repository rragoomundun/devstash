import type { ZodSchema } from 'zod'

/**
 * Parses input against a Zod schema and returns either the typed data or a
 * user-facing error string from the first validation issue.
 */
export function parseInput<S extends ZodSchema>(
  schema: S,
  input: unknown,
): { data: S['_output'] } | { error: string } {
  const result = schema.safeParse(input)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }
  return { data: result.data }
}

/**
 * Wraps an async operation that returns data in a try/catch and normalises the
 * result to { success: true; data: T } | { success: false; error: string }.
 */
export async function withAction<T>(
  fn: () => Promise<T>,
  errorMsg: string,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch {
    return { success: false, error: errorMsg }
  }
}

/**
 * Wraps an async mutation (no return value) in a try/catch and normalises the
 * result to { success: true } | { success: false; error: string }.
 */
export async function withMutation(
  fn: () => Promise<unknown>,
  errorMsg: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await fn()
    return { success: true }
  } catch {
    return { success: false, error: errorMsg }
  }
}
