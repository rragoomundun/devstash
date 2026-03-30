import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"

export default {
  pages: {
    signIn: '/sign-in',
  },
  providers: [
    GitHub,
    Credentials({
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig
