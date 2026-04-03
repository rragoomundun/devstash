import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { rateLimit, getClientIp, rateLimitResponse, AUTH_LIMITS } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = await rateLimit(AUTH_LIMITS.register, ip);
  if (!rl.success) return rateLimitResponse(rl.resetInSeconds);

  const body = await request.json();
  const { name, email, password, confirmPassword } = body;

  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED === 'true';

  await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      // Mark as verified immediately when verification is disabled
      emailVerified: verificationEnabled ? null : new Date(),
    }
  });

  if (verificationEnabled) {
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires }
    });

    await sendVerificationEmail(email, token);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
