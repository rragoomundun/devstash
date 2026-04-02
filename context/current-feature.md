# Current Feature: Item Drawer — Edit Mode

## Status

In Progress

## Goals

- Edit button in item drawer action bar toggles inline edit mode (same drawer, no navigation)
- In edit mode: action bar replaced with Save and Cancel buttons
- Cancel discards changes, returns to view mode
- Save persists via server action, returns to view mode, refreshes drawer data, shows toast
- Editable for all types: title (required), description, tags (comma-separated input)
- Type-specific fields: content textarea (snippet/prompt/command/note), language input (snippet/command), URL input (link)
- Non-editable in edit mode: item type, collections, dates
- Zod validation in server action: title non-empty, optional fields nullable, tags as trimmed string array
- `updateItem(itemId, data)` server action in `src/actions/items.ts` with ownership check
- `updateItem` query function in `src/lib/db/items.ts`: disconnect all tags, connect-or-create new ones, return updated `ItemDetail`
- After save, call `router.refresh()` so underlying card list reflects changes

## Notes

- No form library — controlled inputs with local state
- Disable Save when title is empty (client-side UX guard only; Zod is source of truth)
- Content textarea is plain text, not a code editor (code editor comes later)
- Return Zod errors in `{ success: false, error }` so client can display field-level errors

## History

- **2026-03-20** — Initial Next.js 16 and Tailwind CSS v4 setup
- **2026-03-22** — Dashboard UI Phase 1: ShadCN UI init, /dashboard route, dark mode by default, top bar with centered search and action buttons, sidebar and main placeholders
- **2026-03-23** — Dashboard UI Phase 2: Collapsible sidebar with Navigation header, item type links with counts, collapsible COLLECTIONS section with favorites/recent and item counts, user avatar area, mobile drawer support
- **2026-03-23** — Dashboard UI Phase 3: Stats cards (items, collections, favorites), recent collections grid with dominant type color accent, pinned items and 10 most recent items sections with type-colored cards and content previews
- **2026-03-23** — Prisma 7 + Neon PostgreSQL: schema with all data models and NextAuth tables, initial migration applied, system item types seeded, PrismaClient singleton with PrismaPg adapter
- **2026-03-24** — Seed Data: demo user (demo@devstash.io), system item types, 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources) with items
- **2026-03-24** — Dashboard Collections: replaced mock data with real Neon DB data via Prisma; collections grid, stats cards, and sidebar (item type counts, collections, user) all use live data
- **2026-03-24** — Dashboard Items: replaced mock item data with real Neon DB data via Prisma; pinned and recent items fetched in server component, ItemCard uses live item type and tags, pinned section hidden when empty
- **2026-03-24** — Stats & Sidebar: sidebar item types link to /items/[slug] with live counts, recent collections show colored circle based on dominant item type, "View all collections" link added
- **2026-03-25** — PRO Badge in Sidebar: replaced lock icon on File and Image types with a subtle shadcn/ui Badge displaying "PRO" inline beside the type name
- **2026-03-26** — Code Audit Quick Wins: optimized dominant color queries (select vs include, shared getDominantColor), added ItemCollection collectionId index with migration, extracted shared ICON_MAP, added DATABASE_URL runtime guard, removed unused packages (postgres, ws, @neondatabase/serverless), removed plaintext password from seed log, replaced inline maxHeight style with Tailwind, added aria-label to mobile drawer close button
- **2026-03-30** — Auth Phase 1: NextAuth v5 with GitHub OAuth, split config for edge compatibility, proxy protecting /dashboard/* with redirect to sign-in, dark theme on built-in sign-in page, Session type extended with user.id
- **2026-03-30** — Auth Phase 2: Credentials provider (email/password) with bcrypt validation, POST /api/auth/register endpoint with input validation and duplicate user check, split config pattern maintained
- **2026-03-30** — Auth Phase 3 UI: custom /sign-in and /register pages, UserAvatar component, sidebar user area with sign-out dropdown, JWT/session callbacks for user.id, dashboard scoped to authenticated user, sidebar fixes (canonical type order, empty-state handling, pinned user area, h-dvh layout), Sonner toast on registration
- **2026-03-30** — Email Verification: send verification email via Resend on registration, block unverified credentials sign-in, /verify-email route to validate token and mark user verified, toasts on sign-in page for unverified/verified states
- **2026-03-30** — Email Verification Toggle: EMAIL_VERIFICATION_ENABLED env flag (false by default); when disabled users are marked verified at registration and the sign-in gate is bypassed, enabling dev use without a Resend sending domain
- **2026-03-30** — Forgot Password: /forgot-password page + POST /api/auth/forgot-password generates a VerificationToken (identifier: password-reset:{email}, 1h expiry) and sends reset email via Resend; /reset-password page + POST /api/auth/reset-password validates token, updates hashed password, deletes token; Forgot password? link on sign-in page; in dev without Resend the reset URL is returned directly to the client for frictionless testing
- **2026-03-31** — Profile Page: /profile route with auth guard; user info card (avatar, name, email, join date); usage stats (total items/collections, per-type breakdown with colored icons); change password dialog (credentials users only) via POST /api/auth/change-password; delete account dialog with confirmation via DELETE /api/auth/delete-account; added shadcn AlertDialog and Dialog components
- **2026-03-31** — Rate Limiting for Auth: Upstash Redis + @upstash/ratelimit with sliding window on login (5/15min, IP+email), register (3/1hr, IP), forgot-password (3/1hr, IP), reset-password (5/15min, IP); reusable src/lib/rate-limit.ts utility; CredentialsSignin subclasses for login errors; 429 responses with Retry-After header on API routes; fail-open when Upstash unavailable
- **2026-04-01** — Items List View: dynamic /dashboard/items/[type] route displaying type-filtered items in a responsive 3-column grid; getItemsByType Prisma query; type header with icon and count; empty state; sidebar links updated to /dashboard/items/ prefix
- **2026-04-01** — Item Drawer: right-side Sheet drawer with full item detail fetched via GET /api/items/[id]; skeleton loading state; action bar (favorite/pin/copy/edit/delete); tags and collections display; ItemsProvider context for drawer state; works on dashboard and items list pages; DevStash title linked to /dashboard
