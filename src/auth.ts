import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { rateLimit, getClientIp, AUTH_LIMITS } from "@/lib/rate-limit"
import authConfig from "./auth.config"

class RateLimitedError extends CredentialsSignin {
  code = "rate-limited"
}

class UnverifiedError extends CredentialsSignin {
  code = "unverified"
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  theme: { colorScheme: "dark" },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const ip = getClientIp(request)
        const rl = await rateLimit(AUTH_LIMITS.login, `${ip}:${email}`)
        if (!rl.success) throw new RateLimitedError()

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.hashedPassword) return null

        const isValid = await bcrypt.compare(password, user.hashedPassword)
        if (!isValid) return null

        if (process.env.EMAIL_VERIFICATION_ENABLED === 'true' && !user.emailVerified) {
          throw new UnverifiedError()
        }

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isPro: true },
        })
        token.isPro = dbUser?.isPro ?? false
      }

      return token
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      session.user.isPro = token.isPro === true
      return session
    },
  },
})
