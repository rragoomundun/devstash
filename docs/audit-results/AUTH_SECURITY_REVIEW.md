# Auth Security Review

**Last audit:** 2026-03-31
**Auditor:** Claude Auth Auditor
**Scope:** NextAuth v5 + custom auth flows (credentials, email verification, password reset, profile)

---

## Findings

### [HIGH] — Open Redirect via Unvalidated callbackUrl

**File:** `src/app/sign-in/page.tsx:14,62`
**Issue:** The `callbackUrl` query parameter is read from the URL and passed directly to `window.location.href` after a successful sign-in without any origin validation. An attacker can craft a link like `/sign-in?callbackUrl=https://evil.com` and after the victim signs in, they are redirected to the attacker-controlled domain. This also affects the GitHub OAuth button on line 116 which passes the same unvalidated `callbackUrl` to `signIn('github', { callbackUrl })`.
**Impact:** Phishing attacks. An attacker sends a crafted link, the victim signs in legitimately, and is then redirected to a fake site that looks like DevStash asking them to re-enter credentials or other sensitive information.
**Fix:**

```ts
// src/app/sign-in/page.tsx
function isSafeCallbackUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.origin === window.location.origin
  } catch {
    return false
  }
}

// In SignInForm, replace:
const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

// With:
const rawCallbackUrl = searchParams.get('callbackUrl') ?? ''
const callbackUrl = rawCallbackUrl && isSafeCallbackUrl(rawCallbackUrl)
  ? rawCallbackUrl
  : '/dashboard'
```

---

### [HIGH] — No Rate Limiting on Any Auth Endpoint

**File:** `src/app/api/auth/register/route.ts:7`, `src/app/api/auth/forgot-password/route.ts:6`, `src/app/api/auth/reset-password/route.ts:5`, `src/app/api/auth/change-password/route.ts:6`
**Issue:** None of the custom auth API routes implement any rate limiting. An attacker can:
- Spam `/api/auth/register` to enumerate valid emails (409 vs 201), exhaust Resend quota, or fill the database.
- Spam `/api/auth/forgot-password` to exhaust email sending quota or cause a denial-of-service for a target user (invalidating their valid token on each call via `deleteMany`).
- Brute-force `/api/auth/reset-password` if the token space were ever weaker.
- Brute-force `/api/auth/change-password` without lockout (current password attempts are unlimited).

Note: The credentials sign-in path goes through NextAuth's `authorize` callback (`src/auth.ts:21`) which also has no rate limiting applied to it.

**Impact:** Account enumeration, email quota exhaustion, brute-force credential attacks, targeted denial of password-reset service.
**Fix:**

```ts
// Install: npm install @upstash/ratelimit @upstash/redis
// Or use a simple in-process rate limiter for MVP: npm install express-rate-limit / rate-limiter-flexible

// Example using the rate-limiter-flexible package (in-memory, replace with Redis for production):
// src/lib/rate-limit.ts
import { RateLimiterMemory } from 'rate-limiter-flexible'

const limiters: Record<string, RateLimiterMemory> = {}

export function getRateLimiter(key: string, points: number, duration: number) {
  if (!limiters[key]) {
    limiters[key] = new RateLimiterMemory({ points, duration })
  }
  return limiters[key]
}

export async function rateLimit(
  limiterKey: string,
  clientKey: string,
  points: number,
  durationSecs: number
): Promise<boolean> {
  const limiter = getRateLimiter(limiterKey, points, durationSecs)
  try {
    await limiter.consume(clientKey)
    return true
  } catch {
    return false
  }
}

// In forgot-password/route.ts:
import { rateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  const allowed = await rateLimit('forgot-password', ip, 5, 900) // 5 per 15 min
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  // ... rest of handler
}
```

---

### [MEDIUM] — No Minimum Password Length or Complexity Validation

**File:** `src/app/api/auth/register/route.ts:10-21`, `src/app/api/auth/reset-password/route.ts:9-15`, `src/app/api/auth/change-password/route.ts:15-21`
**Issue:** None of the three auth endpoints that accept a new password validate its length or complexity. A single-character password like `a` is accepted by all three. The client-side HTML `required` attribute on password inputs provides no protection against direct API calls.
**Impact:** Users can set trivially weak passwords, significantly reducing the security of credentials-based accounts.
**Fix:**

```ts
// Add this validation helper (e.g., in src/lib/auth-validation.ts):
export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  return null
}

// Apply in register/route.ts, reset-password/route.ts, and change-password/route.ts:
const passwordError = validatePassword(password)
if (passwordError) {
  return NextResponse.json({ error: passwordError }, { status: 400 })
}
```

---

### [MEDIUM] — Dev Mode Reset Token Leaked in API Response

**File:** `src/app/api/auth/forgot-password/route.ts:32-35`
**Issue:** When `NODE_ENV === 'development'` and the Resend send fails, the full password-reset URL including the plaintext token is returned in the JSON response body. While intentional for development convenience, this token has real security value (it grants password-reset capability). If this code ever runs in an environment where `NODE_ENV` is `'development'` but the app is network-accessible (a staging server, a developer's machine on a shared network), the token is exposed to anyone who can call the endpoint.
**Impact:** Depending on environment configuration, an attacker who calls `/api/auth/forgot-password` with a known victim email could receive the password-reset token directly in the response.
**Fix:**

```ts
// Scope the dev leak more tightly — only return it if ALSO running on localhost:
if (process.env.NODE_ENV === 'development') {
  const host = request.headers.get('host') ?? ''
  const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1')
  if (isLocalhost) {
    const resetUrl = `/reset-password?token=${token}&email=${encodeURIComponent(email)}`
    return NextResponse.json({ success: true, devResetUrl: resetUrl })
  }
}
console.error('[forgot-password] Failed to send reset email:', err)
```

---

### [MEDIUM] — No Email Format Validation in Register API

**File:** `src/app/api/auth/register/route.ts:10-21`
**Issue:** The register endpoint only checks that `email` is truthy. It does not validate that the value is a properly formatted email address. Any non-empty string is accepted as `email`, which gets stored in the database and used as the `identifier` in `VerificationToken`. While Prisma enforces the `@unique` constraint on `User.email`, an attacker could create accounts with malformed email-like strings (e.g., `"not-an-email"`) that will never be reachable for verification.
**Impact:** Low direct impact, but can lead to database pollution and may cause unexpected behavior in email-based flows.
**Fix:**

```ts
// src/app/api/auth/register/route.ts
import { z } from 'zod'

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }
  const { name, email, password, confirmPassword } = parsed.data
  // ... rest of handler
}
```

---

### [LOW] — Proxy Middleware Not Wired as Next.js Middleware

**File:** `src/proxy.ts:1`
**Issue:** `src/proxy.ts` exports a NextAuth-wrapped middleware function and a `config` matcher, but Next.js only automatically loads middleware from `src/middleware.ts` (or `middleware.ts` at the project root). Because the file is named `proxy.ts`, it is never invoked by the Next.js runtime. The intended protection — redirecting unauthenticated users away from `/dashboard/*` at the edge before the page renders — is silently inactive.
**Impact:** Unauthenticated requests to `/dashboard` do reach the page server function before being redirected. The pages themselves do have `auth()` checks (`dashboard/page.tsx:13-14`, `profile/page.tsx:15`), so access is ultimately denied, but: (1) database queries run before the auth check in any page that fetches data before checking the session; (2) the intended UX (instant edge redirect) is not happening; (3) any future dashboard sub-routes added without an explicit `auth()` check will be unprotected.
**Fix:**

```ts
// Rename src/proxy.ts to src/middleware.ts (or create src/middleware.ts that re-exports):
// src/middleware.ts
export { proxy as default, config } from './proxy'

// Or inline the content directly in src/middleware.ts and delete src/proxy.ts.
```

---

### [LOW] — Delete Account Requires No Re-Authentication

**File:** `src/app/api/auth/delete-account/route.ts:5-14`
**Issue:** Permanent account deletion is gated only on having a valid session (`session.user.id`). There is no password confirmation or other re-authentication step. If an attacker gains brief access to a victim's authenticated browser session (e.g., via a shared device left unlocked, an XSS vulnerability elsewhere, or a session fixation scenario), they can permanently delete the account with a single HTTP `DELETE` request.
**Impact:** Irreversible account and data deletion with a stolen session.
**Fix:**

```ts
// For credentials users, require the current password before deletion.
// In delete-account/route.ts:
export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { password } = body

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hashedPassword: true },
  })

  // Require password confirmation for credentials accounts
  if (user?.hashedPassword) {
    if (!password) {
      return NextResponse.json({ error: 'Password confirmation required' }, { status: 400 })
    }
    const isValid = await bcrypt.compare(password, user.hashedPassword)
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 403 })
    }
  }

  await prisma.user.delete({ where: { id: session.user.id } })
  return NextResponse.json({ success: true })
}
```

---

## Passed Checks

- **bcrypt cost factor is sufficient** — All password hashing uses `bcrypt.hash(password, 12)`, which is a strong cost factor well above the typical minimum of 10. (`src/app/api/auth/register/route.ts:23`, `src/app/api/auth/reset-password/route.ts:26`, `src/app/api/auth/change-password/route.ts:37`)

- **Token generation uses cryptographically secure randomness** — All token generation uses `randomBytes(32).toString('hex')` from Node.js `crypto`, producing 256 bits of entropy. (`src/app/api/auth/register/route.ts:37`, `src/app/api/auth/forgot-password/route.ts:18`)

- **Password reset token is single-use** — The token is deleted in a Prisma `$transaction` together with the password update, preventing reuse even if the HTTP response is replayed. (`src/app/api/auth/reset-password/route.ts:28-36`)

- **Email verification token is single-use** — The verification token is deleted atomically with the `emailVerified` update. (`src/app/verify-email/page.tsx:21-29`)

- **Token expiration is enforced** — Both the reset-password and verify-email handlers explicitly check `record.expires < new Date()` before honoring the token. (`src/app/api/auth/reset-password/route.ts:22`, `src/app/verify-email/page.tsx:17`)

- **User enumeration avoided in forgot-password** — The endpoint always returns HTTP 200 `{ success: true }` regardless of whether the email exists in the database, with a comment explaining this intent. (`src/app/api/auth/forgot-password/route.ts:14,40`)

- **Change password verifies current password** — The change-password endpoint fetches the stored hash and verifies the provided current password with `bcrypt.compare` before accepting the new one. (`src/app/api/auth/change-password/route.ts:32-34`)

- **Change password is session-scoped** — The endpoint looks up the user by `session.user.id` (from the JWT token), not by a user-supplied identifier, preventing horizontal privilege escalation. (`src/app/api/auth/change-password/route.ts:23-26`)

- **Delete account is session-scoped** — Same pattern: deletes by `session.user.id` only, so an authenticated user cannot target another user's account. (`src/app/api/auth/delete-account/route.ts:12`)

- **Password reset looks up user by token+identifier composite key** — The reset-password route queries `{ identifier_token: { identifier, token } }` rather than by token alone, tying the token to the specific email address. (`src/app/api/auth/reset-password/route.ts:18-20`)

- **Existing reset tokens are invalidated on new request** — Before creating a new reset token, all existing tokens for that email's `identifier` are deleted, preventing token accumulation. (`src/app/api/auth/forgot-password/route.ts:23`)

- **OAuth-only accounts are protected from password flows** — The change-password endpoint explicitly rejects requests from accounts without a `hashedPassword`, preventing OAuth users from accidentally entering these flows. (`src/app/api/auth/change-password/route.ts:28-30`)

- **Email verification toggle does not introduce bypass** — When `EMAIL_VERIFICATION_ENABLED=false`, users are marked as `emailVerified` at registration time rather than skipping the check at sign-in time, so the logic is consistent. (`src/app/api/auth/register/route.ts:24,32`)

- **Session-protected API routes use server-side auth()** — Both `change-password` and `delete-account` call `auth()` on the server via the NextAuth `auth` export, not a client-provided token or header. (`src/app/api/auth/change-password/route.ts:7`, `src/app/api/auth/delete-account/route.ts:6`)
