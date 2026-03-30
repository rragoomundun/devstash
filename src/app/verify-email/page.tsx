import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Props {
  searchParams: Promise<{ token?: string; email?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token, email } = await searchParams

  if (!token || !email) redirect('/sign-in')

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  })

  if (!record || record.expires < new Date()) {
    redirect('/sign-in?error=invalid-token')
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    }),
  ])

  redirect('/sign-in?verified=true')
}
