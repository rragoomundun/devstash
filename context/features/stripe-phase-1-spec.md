# Stripe Integration Phase 1 — Core Infrastructure

## Overview

Install Stripe, wire `isPro` into the session, create the Stripe client singleton, the checkout session route, the customer portal route, add a `usageLimits` module with unit tests, and enforce free-tier limits in the DB layer.

No UI beyond the existing settings page scaffolding. No webhook handling yet (Phase 2).

## Requirements

### 1. Install dependency

```bash
npm install stripe
```

### 2. Env vars

Add to `.env`:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID_MONTHLY`, and `STRIPE_PRICE_ID_YEARLY` are already present.

### 3. Stripe client singleton

Create `src/lib/stripe.ts`:
- Export a singleton `stripe` instance initialised with `STRIPE_SECRET_KEY`
- Fetch the latest Stripe SDK docs from Context7 and use the current `apiVersion`

### 4. Surface `isPro` in the session

**`src/types/next-auth.d.ts`** — extend Session.user and JWT with `isPro: boolean`.

**`src/auth.ts`** JWT callback — always read `isPro` from the DB on every token validation so Stripe webhook updates (Phase 2) are reflected on the next page load without needing a manual `update()` call:

```typescript
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
```

**`src/auth.ts`** session callback — expose `isPro` on `session.user`:

```typescript
session({ session, token }) {
  if (token.sub) session.user.id = token.sub
  session.user.isPro = token.isPro ?? false
  return session
},
```

### 5. Usage limits module

Create `src/lib/usage-limits.ts`:

```typescript
export const FREE_ITEM_LIMIT = 50
export const FREE_COLLECTION_LIMIT = 3

export function isOverItemLimit(count: number, isPro: boolean): boolean
export function isOverCollectionLimit(count: number, isPro: boolean): boolean
```

Pure functions — no Prisma calls. This makes them unit-testable.

Create `src/lib/usage-limits.test.ts` with Vitest unit tests covering:
- Returns `false` when Pro (no limit)
- Returns `false` when under the free limit
- Returns `false` at exactly the limit boundary (50 items / 3 collections is the last allowed)
- Returns `true` when over the free limit (51 items / 4 collections)

### 6. Enforce free-tier limits in the DB layer

**`src/lib/db/items.ts`** — add at the start of `createItem()`:

```typescript
const [itemCount, user] = await Promise.all([
  prisma.item.count({ where: { userId } }),
  prisma.user.findUnique({ where: { id: userId }, select: { isPro: true } }),
])
if (isOverItemLimit(itemCount, user?.isPro ?? false)) {
  throw new Error('Free tier is limited to 50 items. Upgrade to Pro for unlimited items.')
}
```

**`src/lib/db/collections.ts`** — add at the start of `createCollection()`:

```typescript
const [collectionCount, user] = await Promise.all([
  prisma.collection.count({ where: { userId } }),
  prisma.user.findUnique({ where: { id: userId }, select: { isPro: true } }),
])
if (isOverCollectionLimit(collectionCount, user?.isPro ?? false)) {
  throw new Error('Free tier is limited to 3 collections. Upgrade to Pro for unlimited collections.')
}
```

The existing try-catch in `src/actions/items.ts` and `src/actions/collections.ts` will catch these and return `{ success: false, error: string }` automatically.

### 7. Checkout session API route

Create `src/app/api/stripe/checkout-session/route.ts`:

- `POST` — requires auth
- Accepts `{ priceId }` in the request body (must be one of the two configured price IDs)
- Looks up user's `stripeCustomerId` — if they already have one, pass it as `customer` so Stripe reuses the existing customer record
- Sets `metadata.userId` so the webhook (Phase 2) can look up the user
- Returns `{ url }` pointing to the Stripe Checkout page

### 8. Customer portal API route

Create `src/app/api/stripe/customer-portal/route.ts`:

- `POST` — requires auth
- Looks up the user's `stripeCustomerId` — returns 400 if not found
- Creates a Stripe Billing Portal session
- Returns `{ url }` for the client to redirect to

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe client singleton |
| `src/lib/usage-limits.ts` | Pure limit helpers |
| `src/lib/usage-limits.test.ts` | Unit tests (Vitest) |
| `src/app/api/stripe/checkout-session/route.ts` | Create checkout session |
| `src/app/api/stripe/customer-portal/route.ts` | Billing portal redirect |

## Files to Modify

| File | Change |
|------|--------|
| `src/types/next-auth.d.ts` | Add `isPro: boolean` to Session + JWT types |
| `src/auth.ts` | JWT callback: always-sync `isPro`; session callback: expose it |
| `src/lib/db/items.ts` | Free tier 50-item limit check in `createItem()` |
| `src/lib/db/collections.ts` | Free tier 3-collection limit check in `createCollection()` |
| `.env` | Add `NEXT_PUBLIC_APP_URL` |

## Testing

1. Run `npm test` — all `usage-limits` unit tests pass
2. Run `npm run build` — no TypeScript errors
3. Verify `session.user.isPro` is `false` for the demo user (check via a console.log in a server component temporarily)
4. The checkout and portal routes are not testable until Phase 2 (needs Stripe CLI and webhook secret)

## Key Gotchas

- Use Context7 to fetch the latest Stripe SDK docs before implementing — check the current `apiVersion` string
- The JWT always-sync pattern adds one DB query per session validation. This is intentional and necessary for Phase 2 webhook updates to be reflected without a forced `update()` call.
- `isOverItemLimit(50, false)` should return `false` (50 is the last allowed, the 51st triggers the error) — be precise about the boundary in both the implementation and tests
