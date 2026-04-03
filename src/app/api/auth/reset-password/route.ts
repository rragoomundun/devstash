import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp, rateLimitResponse, AUTH_LIMITS } from '@/lib/rate-limit';
import { validatePassword } from '@/lib/auth-validation';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = await rateLimit(AUTH_LIMITS.resetPassword, ip);
  if (!rl.success) return rateLimitResponse(rl.resetInSeconds);

  const body = await request.json();
  const { email, token, password, confirmPassword } = body;

  if (!email || !token || !password || !confirmPassword) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const passwordError = validatePassword(password, confirmPassword);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const identifier = `password-reset:${email}`;
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { hashedPassword },
    }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier, token } },
    }),
  ]);

  return NextResponse.json({ success: true });
}
