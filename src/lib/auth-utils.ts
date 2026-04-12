import { auth } from '@/auth'

/**
 * Returns the authenticated user's id and Pro status, or null if unauthenticated.
 * Callers should early-return { success: false, error: 'Unauthorized' } when null.
 */
export async function requireAuth(): Promise<{ userId: string; isPro: boolean } | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return { userId: session.user.id, isPro: session.user.isPro ?? false }
}
