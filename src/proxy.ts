import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Session } from "next-auth"

const { auth } = NextAuth(authConfig)

export const proxy = auth(function proxy(
  req: NextRequest & { auth: Session | null }
) {
  const isLoggedIn = !!req.auth?.user

  if (req.nextUrl.pathname.startsWith("/dashboard") && !isLoggedIn) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
