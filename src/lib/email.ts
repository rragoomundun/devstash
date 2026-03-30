import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  const { error } = await resend.emails.send({
    from: 'DevStash <onboarding@resend.dev>',
    to: email,
    subject: 'Reset your password — DevStash',
    html: `
      <p>You requested a password reset for your DevStash account.</p>
      <p>Click the link below to set a new password. The link expires in 1 hour.</p>
      <p><a href="${resetUrl}">Reset my password</a></p>
      <p>If you did not request a password reset, you can ignore this email.</p>
    `
  });

  if (error) {
    console.error('[Resend] Failed to send password reset email:', error);
    throw new Error(error.message);
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const { error } = await resend.emails.send({
    from: 'DevStash <onboarding@resend.dev>',
    to: email,
    subject: 'Verify your email — DevStash',
    html: `
      <p>Thanks for signing up for DevStash.</p>
      <p>Click the link below to verify your email address. The link expires in 24 hours.</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>If you did not create an account, you can ignore this email.</p>
    `
  });

  if (error) {
    console.error('[Resend] Failed to send verification email:', error);
    throw new Error(error.message);
  }

}
