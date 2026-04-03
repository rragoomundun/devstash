import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit, rateLimitResponse, AUTH_LIMITS } from '@/lib/rate-limit'
import { validatePassword } from '@/lib/auth-validation'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rl = await rateLimit(AUTH_LIMITS.changePassword, session.user.id)
  if (!rl.success) return rateLimitResponse(rl.resetInSeconds)

  const body = await request.json()
  const { currentPassword, newPassword, confirmPassword } = body

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const passwordError = validatePassword(newPassword, confirmPassword)
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hashedPassword: true },
  })

  if (!user?.hashedPassword) {
    return NextResponse.json({ error: 'Password change not available for OAuth accounts' }, { status: 400 })
  }

  const isValid = await bcrypt.compare(currentPassword, user.hashedPassword)
  if (!isValid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { hashedPassword },
  })

  return NextResponse.json({ success: true })
}
