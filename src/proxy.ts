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

  const protectedPaths = ["/dashboard", "/items", "/collections"]
  const isProtected = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p))

  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/items/:path*", "/collections/:path*"],
}
