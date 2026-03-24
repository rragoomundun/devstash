# Current Feature

Seed Data — populate the database with a demo user, system item types, collections, and items for development and demos.

## Status

In Progress

## Goals

- Create demo user: demo@devstash.io / 12345678 (bcryptjs, 12 rounds), isPro: false
- Seed system item types (Snippet, Prompt, Command, Note, File, Image, Link)
- Seed collections with items:
  - **React Patterns** — 3 TypeScript snippets (custom hooks, component patterns, utilities)
  - **AI Workflows** — 3 prompts (code review, docs generation, refactoring)
  - **DevOps** — 1 snippet, 1 command, 2 links (real URLs)
  - **Terminal Commands** — 4 commands (git, docker, process mgmt, package manager)
  - **Design Resources** — 4 links (real URLs: CSS/Tailwind, component libs, design systems, icons)

## Notes

- Use `prisma/seed.ts` (TypeScript, run via tsx)
- Password hashed with bcryptjs, 12 rounds
- System item types use `isSystem: true` and `userId: null`
- Links use real, valid URLs
- Script must be idempotent (skip if data already exists)

## History

- **2026-03-20** — Initial Next.js 16 and Tailwind CSS v4 setup
- **2026-03-22** — Dashboard UI Phase 1: ShadCN UI init, /dashboard route, dark mode by default, top bar with centered search and action buttons, sidebar and main placeholders
- **2026-03-23** — Dashboard UI Phase 2: Collapsible sidebar with Navigation header, item type links with counts, collapsible COLLECTIONS section with favorites/recent and item counts, user avatar area, mobile drawer support
- **2026-03-23** — Dashboard UI Phase 3: Stats cards (items, collections, favorites), recent collections grid with dominant type color accent, pinned items and 10 most recent items sections with type-colored cards and content previews
- **2026-03-23** — Prisma 7 + Neon PostgreSQL: schema with all data models and NextAuth tables, initial migration applied, system item types seeded, PrismaClient singleton with PrismaPg adapter
