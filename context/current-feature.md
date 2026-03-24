# Current Feature

Stats & Sidebar — Live DB Data

## Status

In Progress

## Goals

- Display stats pertaining to database data, keeping the current design/layout
- Display item types in sidebar with their icons, linking to `/items/[typename]`
- Add "View all collections" link under the collections list that goes to `/collections`
- Keep the star icons for favorite collections but for recents, each collection should show a colored circle based on the most-used item type in that collection
- Create `src/lib/db/items.ts` and add the database functions (use `collections.ts` for reference)

## Notes

- Reference: `src/lib/db/collections.ts`

## History

- **2026-03-20** — Initial Next.js 16 and Tailwind CSS v4 setup
- **2026-03-22** — Dashboard UI Phase 1: ShadCN UI init, /dashboard route, dark mode by default, top bar with centered search and action buttons, sidebar and main placeholders
- **2026-03-23** — Dashboard UI Phase 2: Collapsible sidebar with Navigation header, item type links with counts, collapsible COLLECTIONS section with favorites/recent and item counts, user avatar area, mobile drawer support
- **2026-03-23** — Dashboard UI Phase 3: Stats cards (items, collections, favorites), recent collections grid with dominant type color accent, pinned items and 10 most recent items sections with type-colored cards and content previews
- **2026-03-23** — Prisma 7 + Neon PostgreSQL: schema with all data models and NextAuth tables, initial migration applied, system item types seeded, PrismaClient singleton with PrismaPg adapter
- **2026-03-24** — Seed Data: demo user (demo@devstash.io), system item types, 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources) with items
- **2026-03-24** — Dashboard Collections: replaced mock data with real Neon DB data via Prisma; collections grid, stats cards, and sidebar (item type counts, collections, user) all use live data
- **2026-03-24** — Dashboard Items: replaced mock item data with real Neon DB data via Prisma; pinned and recent items fetched in server component, ItemCard uses live item type and tags, pinned section hidden when empty
