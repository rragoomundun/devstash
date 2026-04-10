# Stripe Integration Phase 2 — Webhooks, Feature Gating & Billing UI

## Overview

Complete the Stripe integration: webhook handler, Pro enforcement on file uploads and item-type access, Billing section on the settings page, and upgrade CTA for free users. Requires Phase 1 to be complete.

## Prerequisites

- Phase 1 complete (`isPro` in session, usage limits enforced, checkout + portal routes exist)
- Stripe CLI installed locally for webhook testing

## Requirements

### 1. Webhook handler

Create `src/app/api/webhooks/stripe/route.ts`:

- `export const runtime = 'nodejs'` — required to read raw request body
- Read body as raw text with `req.text()` (not parsed JSON)
- Verify signature with `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`
- Return 400 on invalid signature

Events to handle:

| Event | DB action |
|-------|-----------|
| `checkout.session.completed` | `isPro = true`, store `stripeCustomerId` + `stripeSubscriptionId` (look up user by `session.metadata.userId`) |
| `customer.subscription.updated` | Re-check subscription status — if `status !== 'active'` set `isPro = false` |
| `customer.subscription.deleted` | `isPro = false`, `stripeSubscriptionId = null` |

Idempotency: Stripe may deliver the same event more than once. Prisma `update` and `updateMany` are safe to call multiple times with the same data.

### 2. Pro gate: file upload API

**`src/app/api/upload/route.ts`** — after the existing auth check, add:

```typescript
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { isPro: true },
})
if (!user?.isPro) {
  return NextResponse.json(
    { error: 'File uploads require a Pro subscription.' },
    { status: 403 }
  )
}
```

### 3. Pro gate: File/Image routes

**`src/app/(app)/items/[type]/page.tsx`** — redirect free users who navigate to the files or images routes:

```typescript
if (!session.user.isPro && (slug === 'files' || slug === 'images')) {
  redirect('/settings?upgrade=true')
}
```

### 4. Pro gate: CreateItemDialog

**`src/components/dashboard/CreateItemDialog.tsx`** — filter File and Image item types out of the type selector for free users.

- `isPro` is available on `session.user` (Phase 1). Pass it down from the server component that renders `ItemsProvider`, or add it to the `ItemsProvider` context.
- Filter logic: `types.filter(t => session.user.isPro || !PRO_TYPES.has(t.name))`
- `PRO_TYPES` is already defined in `src/lib/item-type-utils.ts` (exported as a constant). Use it — do not duplicate it.

### 5. Billing section on settings page

**Create `src/components/settings/BillingSection.tsx`** (client component).

**Free user view:**
- "Free Plan" label
- Item usage: progress bar or text `X / 50 items`
- Collection usage: progress bar or text `X / 3 collections`
- "Upgrade to Pro" button — calls `POST /api/stripe/checkout-session` with `STRIPE_PRICE_ID_MONTHLY` or `STRIPE_PRICE_ID_YEARLY` (show a monthly/yearly toggle, same as homepage pricing)
- On success, redirect to the Stripe Checkout URL returned by the API

**Pro user view:**
- "Pro Plan" badge
- "Manage Subscription" button — calls `POST /api/stripe/customer-portal`, redirects to the portal URL

**`src/app/(app)/settings/page.tsx`** — add `BillingSection` as a new section below "Account". Pass `isPro`, `itemCount`, and `collectionCount` as props (fetch counts server-side in the page).

Handle the `?upgraded=true` query param on this page: show a success toast on mount ("Welcome to Pro!") and strip the param from the URL.

## Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/webhooks/stripe/route.ts` | Webhook event handler |
| `src/components/settings/BillingSection.tsx` | Billing UI on settings page |

## Files to Modify

| File | Change |
|------|--------|
| `src/app/api/upload/route.ts` | Add Pro check before accepting upload |
| `src/app/(app)/items/[type]/page.tsx` | Redirect free users from files/images routes |
| `src/components/dashboard/CreateItemDialog.tsx` | Filter File/Image types for free users |
| `src/app/(app)/settings/page.tsx` | Add BillingSection, handle `?upgraded=true` toast |
| `.env` | Fill in `STRIPE_WEBHOOK_SECRET` (from Stripe CLI or Dashboard) |

## Testing

Requires Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed webhook signing secret into `STRIPE_WEBHOOK_SECRET` in `.env`.

**Checklist:**

- [ ] Free user cannot see File/Image in the Create Item type selector
- [ ] Free user navigating to `/items/files` or `/items/images` is redirected to `/settings?upgrade=true`
- [ ] Free user cannot upload a file via `POST /api/upload` — gets 403
- [ ] Clicking "Upgrade to Pro" → Monthly redirects to Stripe Checkout
- [ ] Completing test checkout → Stripe CLI forwards `checkout.session.completed` → `isPro = true` in DB
- [ ] Next page load after checkout shows Pro plan in Billing section
- [ ] `?upgraded=true` toast fires once then URL is cleaned up
- [ ] "Manage Subscription" button opens Stripe Customer Portal
- [ ] Cancelling subscription via portal → `customer.subscription.deleted` webhook → `isPro = false` in DB
- [ ] After cancellation, next session validation reflects `isPro = false`
- [ ] Webhook returns 400 for tampered/invalid signature
- [ ] `npm run build` passes with no TypeScript errors

## Key Gotchas

- The webhook route must use `runtime = 'nodejs'`. The default Next.js Edge runtime cannot read the raw body needed for Stripe signature verification.
- Do NOT use `req.json()` in the webhook handler — Stripe signature verification requires the raw body bytes.
- `checkout.session.completed` fires for one-time payments too. Confirm `session.mode === 'subscription'` before updating `isPro` if you ever add non-subscription products.
- The `?upgraded=true` toast should be shown using a `useEffect` with a ref guard (same pattern used on the sign-in page for `?registered=true`) to avoid showing it on re-renders.
