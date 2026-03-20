# 🗄️ DevStash — Project Overview

> **One fast, searchable, AI-enhanced hub for all your developer knowledge & resources.**

---

## Table of Contents

- [Problem](#problem)
- [Target Users](#target-users)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Data Models (Prisma)](#data-models-prisma)
- [Item Type System](#item-type-system)
- [Features](#features)
- [Monetization](#monetization)
- [UI/UX Guidelines](#uiux-guidelines)
- [Page & Route Map](#page--route-map)
- [Key Conventions](#key-conventions)

---

## Problem

Developers keep their essentials scattered across too many surfaces:

| What                | Where it ends up              |
| ------------------- | ----------------------------- |
| Code snippets       | VS Code, Notion, Gists       |
| AI prompts          | Chat histories                |
| Context files       | Buried in project directories |
| Useful links        | Browser bookmarks             |
| Docs & notes        | Random folders                |
| Terminal commands    | `.bash_history`, `.txt` files |
| Project boilerplate | GitHub Gists, repos           |

This creates **context switching**, **lost knowledge**, and **inconsistent workflows**.

DevStash solves this by providing a single, fast, searchable, AI-enhanced hub for all developer knowledge and resources.

---

## Target Users

| Persona                       | Core Need                                              |
| ----------------------------- | ------------------------------------------------------ |
| **Everyday Developer**        | Fast access to snippets, prompts, commands, links      |
| **AI-first Developer**        | Save & organize prompts, contexts, system messages      |
| **Content Creator / Educator**| Store code blocks, explanations, course notes          |
| **Full-stack Builder**        | Collect patterns, boilerplates, API examples           |

---

## Tech Stack

| Layer              | Technology                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Framework**      | [Next.js 16](https://nextjs.org/) / [React 19](https://react.dev/)                                            |
| **Language**       | [TypeScript](https://www.typescriptlang.org/)                                                                  |
| **Database**       | [Neon](https://neon.tech/) (Serverless PostgreSQL)                                                             |
| **ORM**            | [Prisma 7](https://www.prisma.io/) (latest — fetch docs before use)                                           |
| **Auth**           | [NextAuth v5](https://authjs.dev/) — Email/password + GitHub OAuth                                             |
| **File Storage**   | [Cloudflare R2](https://developers.cloudflare.com/r2/)                                                        |
| **AI**             | [OpenAI](https://platform.openai.com/) — `gpt-5-nano`                                                         |
| **Styling**        | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)                             |
| **Caching**        | Redis (TBD)                                                                                                    |

**Key principle:** One codebase, one repo — SSR pages with dynamic client components, API routes for backend logic (items, file uploads, AI calls).

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                     │
│  Next.js 16 App Router  ·  React 19  ·  Tailwind + shadcn  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                    SSR / API Routes
                               │
┌──────────────────────────────┴──────────────────────────────┐
│                     Next.js Server                          │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ NextAuth │  │ Prisma ORM   │  │ API Route Handlers │    │
│  │   v5     │  │ (v7)         │  │                    │    │
│  └────┬─────┘  └──────┬───────┘  └─────────┬──────────┘    │
└───────┼───────────────┼────────────────────┼────────────────┘
        │               │                    │
        ▼               ▼                    ▼
   ┌─────────┐   ┌────────────┐     ┌───────────────┐
   │  GitHub  │   │ Neon       │     │ Cloudflare R2 │
   │  OAuth   │   │ PostgreSQL │     │ (File Storage)│
   └─────────┘   └────────────┘     └───────────────┘
                                           │
                                    ┌──────┴──────┐
                                    │  OpenAI API │
                                    │  gpt-5-nano │
                                    └─────────────┘
```

---

## Data Models (Prisma)

> ⚠️ **Migration Policy:** NEVER use `db push` or directly update the database structure. Always create migrations to be run in dev first, then in production.

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────
// User (extends NextAuth)
// ─────────────────────────────────────
model User {
  id                  String    @id @default(cuid())
  name                String?
  email               String?   @unique
  emailVerified       DateTime?
  image               String?
  hashedPassword      String?
  isPro               Boolean   @default(false)
  stripeCustomerId    String?   @unique
  stripeSubscriptionId String?  @unique

  accounts    Account[]
  sessions    Session[]
  items       Item[]
  collections Collection[]
  itemTypes   ItemType[]    // user-created custom types

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// NextAuth required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─────────────────────────────────────
// Item
// ─────────────────────────────────────
model Item {
  id          String   @id @default(cuid())
  title       String
  description String?
  contentType ContentType @default(TEXT)
  content     String?     // text content (null if file)
  fileUrl     String?     // Cloudflare R2 URL (null if text)
  fileName    String?     // original filename (null if text)
  fileSize    Int?        // bytes (null if text)
  url         String?     // for link-type items
  language    String?     // programming language (optional, for code)
  isFavorite  Boolean  @default(false)
  isPinned    Boolean  @default(false)

  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemTypeId String
  itemType   ItemType @relation(fields: [itemTypeId], references: [id])

  tags        ItemTag[]
  collections ItemCollection[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([itemTypeId])
}

enum ContentType {
  TEXT
  FILE
  URL
}

// ─────────────────────────────────────
// Item Type
// ─────────────────────────────────────
model ItemType {
  id       String  @id @default(cuid())
  name     String
  icon     String
  color    String
  isSystem Boolean @default(false)

  userId String? // null for system types
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)
  items  Item[]

  @@unique([name, userId]) // prevent duplicate names per user
}

// ─────────────────────────────────────
// Collection
// ─────────────────────────────────────
model Collection {
  id            String  @id @default(cuid())
  name          String
  description   String?
  isFavorite    Boolean @default(false)
  defaultTypeId String? // default item type for new items

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items ItemCollection[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

// ─────────────────────────────────────
// Item ↔ Collection (many-to-many)
// ─────────────────────────────────────
model ItemCollection {
  itemId       String
  collectionId String

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  addedAt DateTime @default(now())

  @@id([itemId, collectionId])
}

// ─────────────────────────────────────
// Tag & Item ↔ Tag (many-to-many)
// ─────────────────────────────────────
model Tag {
  id    String    @id @default(cuid())
  name  String    @unique
  items ItemTag[]
}

model ItemTag {
  itemId String
  tagId  String

  item Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}
```

### Entity Relationship Diagram

```
┌──────────┐       ┌───────────┐       ┌──────────────┐
│   User   │──1:N──│   Item    │──N:M──│  Collection  │
└──────────┘       └───────────┘       └──────────────┘
     │                   │                     │
     │ 1:N               │ N:1                 │
     ▼                   ▼                     │
┌──────────┐       ┌───────────┐               │
│ ItemType │──1:N──│  (items)  │               │
└──────────┘       └───────────┘               │
                         │                     │
                         │ N:M          via ItemCollection
                         ▼                     │
                   ┌───────────┐               │
                   │    Tag    │               │
                   └───────────┘               │

 User ──1:N──▶ Item
 User ──1:N──▶ Collection
 User ──1:N──▶ ItemType (custom only; system types have userId = null)
 Item ──N:1──▶ ItemType
 Item ──N:M──▶ Collection (via ItemCollection join table)
 Item ──N:M──▶ Tag (via ItemTag join table)
```

---

## Item Type System

System types are seeded on first deploy and cannot be modified by users. Custom types (Pro only) will be added later.

| Type        | Icon          | Color                   | ContentType | Route              |
| ----------- | ------------- | ----------------------- | ----------- | ------------------ |
| 🔵 Snippet  | `Code`        | `#3b82f6` (blue)        | `TEXT`      | `/items/snippets`  |
| 🟣 Prompt   | `Sparkles`    | `#8b5cf6` (purple)      | `TEXT`      | `/items/prompts`   |
| 🟠 Command  | `Terminal`    | `#f97316` (orange)      | `TEXT`      | `/items/commands`  |
| 🟡 Note     | `StickyNote`  | `#fde047` (yellow)      | `TEXT`      | `/items/notes`     |
| ⚪ File     | `File`        | `#6b7280` (gray)        | `FILE`      | `/items/files`     |
| 🩷 Image    | `Image`       | `#ec4899` (pink)        | `FILE`      | `/items/images`    |
| 🟢 Link     | `Link`        | `#10b981` (emerald)     | `URL`       | `/items/links`     |

> Icons are from [Lucide](https://lucide.dev/icons) (ships with shadcn/ui).

**Access rules:**
- File and Image types are **Pro only** (require file upload to Cloudflare R2).
- All other system types are available on the Free tier.

---

## Features

### A. Items & Item Types

- Items are the core unit — each has a type, content, and metadata.
- Quick creation and access via a **slide-out drawer** (no full page navigation needed).
- Text types use a **Markdown editor** with syntax highlighting.
- File types use a **file upload** flow (stored in Cloudflare R2).
- Link types store a URL and optional description.
- Import code from a file (reads content into a text-type item).

### B. Collections

- User-created groupings that can hold items of **any type**.
- An item can belong to **multiple collections** (many-to-many).
- Examples: "React Patterns" (snippets + notes), "Interview Prep" (snippets + prompts), "Context Files" (files).
- Add/remove items to/from multiple collections at once.
- View which collections an item belongs to from the item drawer.

### C. Search

Full-text search across:
- Item content
- Item titles
- Tags
- Types

Free tier gets basic search. Consider PostgreSQL full-text search (`tsvector`/`tsquery`) or a lightweight search index.

### D. Authentication

- **NextAuth v5** with two providers:
  - Email / Password (credentials)
  - GitHub OAuth
- Session strategy: JWT (for serverless compatibility with Neon).

### E. Organization & Quality of Life

- Favorite items and collections (⭐ toggle)
- Pin items to top of lists (📌)
- Recently used items section
- Dark mode by default, light mode toggle
- Export data as JSON or ZIP (Pro only)

### F. AI Features (Pro Only)

All AI features use `gpt-5-nano` via the OpenAI API.

| Feature                | Description                                        |
| ---------------------- | -------------------------------------------------- |
| **AI Auto-Tag**        | Suggest relevant tags based on item content        |
| **AI Summary**         | Generate a concise summary of an item              |
| **AI Explain Code**    | Plain-language explanation of a code snippet        |
| **Prompt Optimizer**   | Rewrite/improve AI prompts for better results      |

---

## Monetization

### Tier Comparison

| Feature                  | Free             | Pro ($8/mo · $72/yr) |
| ------------------------ | ---------------- | -------------------- |
| Items                    | 50               | Unlimited            |
| Collections              | 3                | Unlimited            |
| System types             | All except file/image | All              |
| Custom types             | —                | Coming soon          |
| File & image uploads     | —                | ✅                   |
| AI features              | —                | ✅                   |
| Search                   | Basic            | Full                 |
| Export (JSON/ZIP)        | —                | ✅                   |
| Priority support         | —                | ✅                   |

**Payment:** Stripe (store `stripeCustomerId` and `stripeSubscriptionId` on User).

**Dev mode:** During development, all users can access all features. Pro gates will be enforced at launch.

---

## UI/UX Guidelines

### Design Principles

- Modern, minimal, developer-focused
- Dark mode default — references: **Notion**, **Linear**, **Raycast**
- Clean typography, generous whitespace
- Subtle borders and soft shadows
- Syntax highlighting in all code views (use [Shiki](https://shiki.style/) or [Prism](https://prismjs.com/))

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  ☰  DevStash                          🔍  ⚙️  [Avatar] │
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  SIDEBAR   │            MAIN CONTENT                    │
│            │                                             │
│  Types     │  Collections (color-coded cards)            │
│  ─ Snippets│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  ─ Prompts │  │ React   │ │ Python  │ │ Context │      │
│  ─ Commands│  │ Patterns│ │ Snippets│ │ Files   │      │
│  ─ Notes   │  │  🔵     │ │  🔵     │ │  ⚪     │      │
│  ─ Files 🔒│  └─────────┘ └─────────┘ └─────────┘      │
│  ─ Images🔒│                                             │
│  ─ Links   │  Items (color-coded border cards)           │
│            │  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  Latest    │  │ snippet │ │ prompt  │ │ command │      │
│  Collections│ │ ──────  │ │ ──────  │ │ ──────  │      │
│  ─ React.. │  │ 🔵 blue │ │ 🟣 purp │ │ 🟠 orng │      │
│  ─ Python..│  └─────────┘ └─────────┘ └─────────┘      │
│            │                                             │
│            │         [Item opens in drawer →]            │
└────────────┴─────────────────────────────────────────────┘
```

- **Sidebar:** Collapsible. Lists item types (with icons + counts) and latest collections. Becomes a mobile drawer on small screens.
- **Main content:** Grid of collection cards (background color based on dominant item type) and item cards (border color based on type).
- **Item drawer:** Slide-in panel for quick view/edit — no full-page navigation needed.

### Color Coding Logic

- **Collection cards:** Background tinted with the color of the item type that appears most in that collection.
- **Item cards:** Border colored by the item's type.

### Micro-interactions

- Smooth transitions on navigation and drawer open/close
- Hover states on all cards (subtle scale or shadow lift)
- Toast notifications for CRUD actions (shadcn `Sonner` or `toast`)
- Loading skeletons while data fetches

### Responsive Strategy

- Desktop-first layout
- Sidebar collapses to hamburger drawer on mobile
- Cards reflow from grid to single column

---

## Page & Route Map

```
/                          → Dashboard (collections + recent items)
/items/snippets            → All snippets
/items/prompts             → All prompts
/items/commands            → All commands
/items/notes               → All notes
/items/files               → All files (Pro)
/items/images              → All images (Pro)
/items/links               → All links
/collections               → All collections
/collections/[id]          → Single collection view
/search                    → Search results page
/settings                  → User settings (profile, theme, billing)
/auth/login                → Sign in
/auth/register             → Sign up

API Routes:
/api/auth/[...nextauth]    → NextAuth handlers
/api/items                 → CRUD for items
/api/items/[id]            → Single item operations
/api/collections           → CRUD for collections
/api/collections/[id]      → Single collection operations
/api/tags                  → Tag management
/api/upload                → File upload to R2
/api/ai/auto-tag           → AI auto-tagging
/api/ai/summarize          → AI summary
/api/ai/explain            → AI code explanation
/api/ai/optimize-prompt    → AI prompt optimizer
/api/stripe/checkout       → Stripe checkout session
/api/stripe/webhook        → Stripe webhook handler
```

---

## Key Conventions

1. **Migrations only** — never use `prisma db push`. Create migrations with `prisma migrate dev` locally, apply with `prisma migrate deploy` in production.
2. **Prisma 7** — always fetch the latest docs before implementing. Breaking changes from v6 are likely.
3. **Pro feature gates** — disabled during development (all features unlocked). Enforce at launch via `user.isPro` checks.
4. **File uploads** — all files go through an API route that uploads to Cloudflare R2 and returns the URL to store in `Item.fileUrl`.
5. **AI calls** — all AI features route through server-side API routes (never expose OpenAI key to client).
6. **Type safety** — TypeScript strict mode, Prisma-generated types used everywhere.
7. **Component library** — shadcn/ui components as the base, customized to match DevStash's design language.
