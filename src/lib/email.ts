import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
