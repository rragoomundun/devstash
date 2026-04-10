# Stripe Integration Plan — DevStash Pro

**Pricing:** \$8/mo (monthly) · $72/yr (annual)

---

## Current State

### What's already done

- **Schema** — `User` model already has `isPro Boolean @default(false)`, `stripeCustomerId String? @unique`, `stripeSubscriptionId String? @unique`. Applied in the initial migration. No schema changes needed.
- **Env vars** — `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY` are configured. `STRIPE_WEBHOOK_SECRET` is empty (needs populating after the webhook endpoint is registered).
- **PRO badge** — File and Image types show a "PRO" badge in the sidebar (`SidebarContent.tsx`). No functional gate exists yet.

### What's missing

- `isPro` is never read from the DB into the session
- No checkout, portal, or webhook routes
- No free-tier limits enforced (50 items, 3 collections)
- No pro check on file upload
- No billing page or upgrade UI

---

## Implementation Order

### 1 — Auth: surface `isPro` in the session

**`src/types/next-auth.d.ts`** — add `isPro` to the user object:

```typescript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isPro?: boolean;
  }
}
```

**`src/auth.ts`** — update callbacks to always sync `isPro` from the DB (this ensures Stripe webhook updates are picked up on the next session validation without needing a manual `update()` call):

```typescript
async jwt({ token, user }) {
  if (user?.id) token.sub = user.id

  // Always sync isPro from DB to catch webhook-driven updates
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
  session.user.isPro = token.isPro ?? false
  return session
},
```

> **Why always-sync instead of `trigger === "update"`:** The Stripe webhook updates `isPro` in the DB. There's no way to push a session update from a webhook handler. Always reading from the DB on JWT validation guarantees the client picks up the change on the next page load/navigation. Cost: one small indexed lookup per session validation.

---

### 2 — Stripe client

**Create `src/lib/stripe.ts`:**

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30'
});
```

---

### 3 — Webhook handler

**Create `src/app/api/webhooks/stripe/route.ts`:**

Key events to handle:

| Event                           | Action                                                                |
| ------------------------------- | --------------------------------------------------------------------- |
| `checkout.session.completed`    | Set `isPro = true`, store `stripeCustomerId` + `stripeSubscriptionId` |
| `customer.subscription.updated` | Update subscription status (handle plan changes)                      |
| `customer.subscription.deleted` | Set `isPro = false`, clear `stripeSubscriptionId`                     |
| `invoice.payment_failed`        | (Optional) notify user                                                |

Implementation notes:

- Use `stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)` to verify signature
- The route must use `export const runtime = 'nodejs'` and read the raw body (not parsed JSON) — use `req.text()` or `req.arrayBuffer()`
- Idempotency: events may be delivered more than once; DB upsert operations are safe

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.user.update({
        where: { id: session.metadata?.userId },
        data: {
          isPro: true,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string
        }
      });
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { isPro: false, stripeSubscriptionId: null }
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

---

### 4 — Checkout session route

**Create `src/app/api/stripe/checkout-session/route.ts`:**

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId } = await req.json();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true }
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: user?.stripeCustomerId ?? undefined,
    customer_email: user?.stripeCustomerId ? undefined : (user?.email ?? undefined),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    metadata: { userId: session.user.id }
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

---

### 5 — Customer portal route

**Create `src/app/api/stripe/customer-portal/route.ts`:**

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true }
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`
  });

  return NextResponse.json({ url: portalSession.url });
}
```

---

### 6 — Free tier limits

**`src/lib/db/items.ts`** — add count check at the start of `createItem()`:

```typescript
const [itemCount, user] = await Promise.all([
  prisma.item.count({ where: { userId } }),
  prisma.user.findUnique({ where: { id: userId }, select: { isPro: true } })
]);
if (!user?.isPro && itemCount >= 50) {
  throw new Error('Free tier is limited to 50 items. Upgrade to Pro for unlimited items.');
}
```

**`src/lib/db/collections.ts`** — add count check at the start of `createCollection()`:

```typescript
const [collectionCount, user] = await Promise.all([
  prisma.collection.count({ where: { userId } }),
  prisma.user.findUnique({ where: { id: userId }, select: { isPro: true } })
]);
if (!user?.isPro && collectionCount >= 3) {
  throw new Error('Free tier is limited to 3 collections. Upgrade to Pro for unlimited collections.');
}
```

The server action layer (`src/actions/items.ts`, `src/actions/collections.ts`) already wraps DB calls in try-catch and returns `{ success: false, error: string }` — these thrown errors will be caught and surfaced to the UI automatically.

---

### 7 — Pro gate: file upload

**`src/app/api/upload/route.ts`** — add pro check after the auth check (around line 34):

```typescript
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { isPro: true }
});
if (!user?.isPro) {
  return NextResponse.json({ error: 'File uploads require a Pro subscription.' }, { status: 403 });
}
```

---

### 8 — Pro gate: File/Image item types in UI

**`src/components/dashboard/CreateItemDialog.tsx`** — the dialog already fetches item types. Filter out `File` and `Image` types when the user is not Pro:

- Pass `isPro` from session (via `ItemsProvider` context or as a prop from the parent server component)
- Filter the type list: `types.filter(t => isPro || !PRO_TYPES.has(t.name))`
- `PRO_TYPES` is already defined in `SidebarContent.tsx` — extract to `src/lib/item-type-utils.ts` (already exists) so it can be shared

**`src/app/(app)/items/[type]/page.tsx`** — redirect free users away from `/items/files` and `/items/images`:

```typescript
const session = await auth();
if (!session?.user?.isPro && (slug === 'files' || slug === 'images')) {
  redirect('/settings?upgrade=true');
}
```

---

### 9 — Billing section on Settings page

**`src/app/(app)/settings/page.tsx`** — add a "Billing" section below "Account":

- **Free users:** show current plan, item/collection usage bars (X/50, X/3), and an "Upgrade to Pro" button
- **Pro users:** show "Pro Plan" badge, next billing date (from Stripe), and a "Manage Subscription" button that calls the customer portal route

Suggested component: `src/components/settings/BillingSection.tsx` (client component — needs button click handlers for checkout/portal calls).

---

### 10 — New env var

Add to `.env`:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Required by the checkout and portal routes to build redirect URLs. Set to the production domain before launch.

---

## Stripe Dashboard Setup

1. **Products** — Already created (price IDs are in `.env`). Verify they match:
   - Monthly: `price_1TKIPc3M1HOXM0vVZTUJmLjL` → $8/mo
   - Yearly: `price_1TKIRR3M1HOXM0vV7H161jl6` → $72/yr

2. **Webhook endpoint** — After deploying (or using `stripe listen` locally):
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events to subscribe: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

3. **Customer Portal** — Enable in Stripe Dashboard → Billing → Customer portal. Configure allowed actions (cancel subscription, update payment method).

4. **Local testing** — Use the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the webhook signing secret it prints into `.env`.

---

## Files to Create

| File                                           | Purpose                     |
| ---------------------------------------------- | --------------------------- |
| `src/lib/stripe.ts`                            | Stripe client singleton     |
| `src/app/api/webhooks/stripe/route.ts`         | Webhook event handler       |
| `src/app/api/stripe/checkout-session/route.ts` | Create checkout session     |
| `src/app/api/stripe/customer-portal/route.ts`  | Redirect to billing portal  |
| `src/components/settings/BillingSection.tsx`   | Billing UI on settings page |

## Files to Modify

| File                                            | Change                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| `src/types/next-auth.d.ts`                      | Add `isPro: boolean` to Session + JWT types                            |
| `src/auth.ts`                                   | JWT callback: always-sync `isPro` from DB; session callback: expose it |
| `src/lib/db/items.ts`                           | Free tier 50-item limit check in `createItem()`                        |
| `src/lib/db/collections.ts`                     | Free tier 3-collection limit check in `createCollection()`             |
| `src/app/api/upload/route.ts`                   | Pro check before accepting upload                                      |
| `src/components/dashboard/CreateItemDialog.tsx` | Filter File/Image types for free users                                 |
| `src/app/(app)/items/[type]/page.tsx`           | Redirect free users from files/images routes                           |
| `src/app/(app)/settings/page.tsx`               | Add BillingSection                                                     |
| `.env`                                          | Add `NEXT_PUBLIC_APP_URL`, fill `STRIPE_WEBHOOK_SECRET`                |

---

## Testing Checklist

- [ ] Free user hits 50-item limit — sees descriptive error toast
- [ ] Free user hits 3-collection limit — sees descriptive error toast
- [ ] Free user cannot access `/items/files` or `/items/images` — redirected to settings
- [ ] Free user cannot upload a file via the API — gets 403
- [ ] Free user cannot see File/Image in the Create Item type selector
- [ ] Clicking "Upgrade to Pro" redirects to Stripe Checkout (correct price)
- [ ] Completing checkout → `isPro` set to `true` in DB, session reflects it on next load
- [ ] Pro user can create unlimited items and collections
- [ ] Pro user can upload files
- [ ] Pro user sees File/Image types in Create Item dialog
- [ ] Cancelling subscription → webhook fires, `isPro` set to `false`
- [ ] "Manage Subscription" opens Stripe Customer Portal
- [ ] Webhook signature validation rejects tampered payloads
- [ ] Stripe CLI local testing works end-to-end
