# Current Feature: File Upload with Cloudflare R2

## Status

In Progress

## Goals

- Upload API route for Cloudflare R2
- FileUpload component with drag-and-drop and progress indicator
- Create item modal supports File/Image types via FileUpload
- Delete files from R2 when items are deleted
- Download proxy API route (avoids CORS)
- Download button in ItemDrawer for file types
- Image preview for images, file info for files

## Notes

**File constraints:**

| Type   | Max Size | Extensions                                                                       |
| ------ | -------- | -------------------------------------------------------------------------------- |
| Images | 5 MB     | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`                                 |
| Files  | 10 MB    | `.pdf`, `.txt`, `.md`, `.json`, `.yaml`, `.yml`, `.xml`, `.csv`, `.toml`, `.ini` |

**MIME types:**
- Images: `image/png`, `image/jpeg`, `image/gif`, `image/webp`, `image/svg+xml`
- Files: `application/pdf`, `text/plain`, `text/markdown`, `application/json`, `application/x-yaml`, `text/yaml`, `application/xml`, `text/xml`, `text/csv`, `application/toml`

**Implementation notes:**
- Prisma/DB functions go in `src/lib/db/items.ts`
- File types are Pro only (already gated in UI)

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
- **2026-04-02** — Item Drawer Edit Mode: inline edit mode toggled within the drawer; controlled inputs for title, description, tags (comma-separated), content, language, and URL; action bar swaps to Save/Cancel; updateItem server action with Zod validation and ownership check; router.refresh() after save to sync card list; field-level error display
- **2026-04-02** — Item Delete: AlertDialog confirmation on delete button; deleteItem server action with ownership check; deleteItem db query with userId constraint; success closes drawer + toast + router.refresh(); error shows toast and keeps drawer open
- **2026-04-02** — Item Create: "New Item" button in top bar opens a Dialog modal; type selector (snippet, prompt, command, note, link); conditional fields per type; createItem server action with Zod validation; createItem db query with connect-or-create tags; ItemsProvider lifted above DashboardShell so TopBar can access openCreate via context; Pro types (File, Image) excluded from selector
- **2026-04-02** — Code Editor: Monaco Editor (vs-dark) for snippet/command types in ItemDrawer and CreateItemDialog; macOS window dots + language label + copy button in editor header; fluid height (80–400px) via onDidContentSizeChange; AddTypeItemButton client component on each type page; openCreate extended with optional typeId for preselection; initialTypeId prop on CreateItemDialog with useEffect sync
- **2026-04-02** — Markdown Editor: MarkdownEditor component with Write/Preview tabs for notes and prompts; react-markdown + remark-gfm for GFM support; dark theme (bg-[#1e1e1e] / bg-[#2d2d2d]); copy button matching CodeEditor style; readonly shows Preview only; fluid height (120–400px); .markdown-preview CSS class with full styling (headings, code blocks, lists, blockquotes, links, tables); integrated in ItemDrawer (view + edit) and CreateItemDialog
