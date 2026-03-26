# Current Feature

Code Audit Quick Wins

## Status

In Progress

## Goals

Fixes from the code-scanner audit that are low-risk and have clear value. Auth bypass is excluded (auth not implemented yet). Each item is independent and can be done in any order.

1. **Fix N+1 dominant color query** — `getRecentCollections` and `getSidebarData` load all item rows per collection into memory to count types in JS. Replace with `prisma.itemCollection.groupBy` (grouped by `collectionId` + `itemTypeId` with `_count`) to compute dominant item type at the DB level. Also extract the shared `getDominantColor` logic to a module-level utility, reused by both functions.

2. **Remove unused packages** — `postgres`, `ws`, and `@neondatabase/serverless` are listed in `package.json` but not used anywhere in `src/`. Remove them.

3. **DATABASE_URL runtime guard** — `src/lib/prisma.ts` uses `process.env.DATABASE_URL!` with no check. Add an explicit `if (!process.env.DATABASE_URL) throw new Error(...)` before the client is created.

4. **Shared ICON_MAP** — `ICON_MAP` is defined identically in `SidebarContent.tsx` and `ItemCard.tsx`. Extract to `src/lib/icon-map.ts` and import in both.

5. **seed.ts password in logs** — `console.log` in seed prints the plaintext demo password. Remove the password from the message.

6. **Inline maxHeight style** — `ItemCard.tsx:63` uses `style={{ maxHeight: ... }}` for a non-dynamic value. Replace with Tailwind classes.

7. **Accessible close button** — Mobile drawer close button in `DashboardShell.tsx` has no `aria-label`. Add `aria-label="Close sidebar"`.

## Notes

- For the N+1 fix, use `prisma.itemCollection.groupBy` — no raw SQL. Check Prisma 7 groupBy API in `node_modules/next/dist/docs/` before writing.
- The `getDominantColor` extraction should result in a single function used by both `getRecentCollections` and `getSidebarData`.

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
