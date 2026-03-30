# Current Feature

## Status

Not Started

## Goals

<!-- bullet points of what success looks like -->

## Notes

<!-- additional context, constraints, or details -->

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
