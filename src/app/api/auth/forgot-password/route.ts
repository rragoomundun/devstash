import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { rateLimit, getClientIp, rateLimitResponse, AUTH_LIMITS } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = await rateLimit(AUTH_LIMITS.forgotPassword, ip);
  if (!rl.success) return rateLimitResponse(rl.resetInSeconds);

  const body = await request.json();
  const { email } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Always respond with success to avoid user enumeration
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = randomBytes(32).toString('hex');
    const identifier = `password-reset:${email}`;
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset token for this email before creating a new one
    await prisma.verificationToken.deleteMany({ where: { identifier } });

    await prisma.verificationToken.create({
      data: { identifier, token, expires },
    });

    try {
      await sendPasswordResetEmail(email, token);
    } catch (err) {
      if (process.env.DEV_RESET_URL_ENABLED === 'true') {
        const resetUrl = `/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        return NextResponse.json({ success: true, devResetUrl: resetUrl });
      }
      console.error('[forgot-password] Failed to send reset email:', err);
    }
  }

  return NextResponse.json({ success: true });
}
