# Item Types Reference

> Generated from Prisma schema, seed data, ICON_MAP, and live database (development branch).

---

## Overview

DevStash uses a typed item system. Every item belongs to exactly one **ItemType**. There are currently 7 system types (seeded on first deploy, `isSystem: true`, `userId: null`). Users cannot modify system types. Custom user-created types (Pro only) are planned but not yet implemented.

---

## Content Classification

Items are classified by the `ContentType` enum into three storage modes:

| ContentType | Storage Mechanism | Key Fields Used | Types |
|-------------|-------------------|-----------------|-------|
| **TEXT** | Inline text in `Item.content` | `content`, `language` (optional) | Snippet, Prompt, Command, Note |
| **FILE** | Uploaded to Cloudflare R2 | `fileUrl`, `fileName`, `fileSize` | File, Image |
| **URL** | External link stored as string | `url` | Link |

---

## System Types (7)

### 1. Snippet

| Property | Value |
|----------|-------|
| **Icon** | `Code` (Lucide) |
| **Color** | `#3b82f6` (blue) |
| **ContentType** | `TEXT` |
| **Route** | `/items/snippets` |
| **Seed ID** | `stype_snippet` |
| **Current count** | 4 |
| **Tier** | Free |

**Purpose:** Store reusable code fragments with syntax highlighting. Supports an optional `language` field for language-specific rendering (e.g., `typescript`, `dockerfile`).

**Key fields:** `content` (code text), `language` (programming language identifier)

---

### 2. Prompt

| Property | Value |
|----------|-------|
| **Icon** | `Sparkles` (Lucide) |
| **Color** | `#8b5cf6` (purple) |
| **ContentType** | `TEXT` |
| **Route** | `/items/prompts` |
| **Seed ID** | `stype_prompt` |
| **Current count** | 3 |
| **Tier** | Free |

**Purpose:** Save and organize AI prompts, system messages, and prompt templates. No `language` field typically used.

**Key fields:** `content` (prompt text)

---

### 3. Command

| Property | Value |
|----------|-------|
| **Icon** | `Terminal` (Lucide) |
| **Color** | `#f97316` (orange) |
| **ContentType** | `TEXT` |
| **Route** | `/items/commands` |
| **Seed ID** | `stype_command` |
| **Current count** | 5 |
| **Tier** | Free |

**Purpose:** Store shell commands, one-liners, and CLI recipes. Content is plain text (shell commands), `language` is not typically set.

**Key fields:** `content` (command text)

---

### 4. Note

| Property | Value |
|----------|-------|
| **Icon** | `StickyNote` (Lucide) |
| **Color** | `#fde047` (yellow) |
| **ContentType** | `TEXT` |
| **Route** | `/items/notes` |
| **Seed ID** | `stype_note` |
| **Current count** | 0 |
| **Tier** | Free |

**Purpose:** Free-form text notes, documentation fragments, and markdown content. No `language` field.

**Key fields:** `content` (note text, supports Markdown)

---

### 5. File

| Property | Value |
|----------|-------|
| **Icon** | `File` (Lucide) |
| **Color** | `#6b7280` (gray) |
| **ContentType** | `FILE` |
| **Route** | `/items/files` |
| **Seed ID** | `stype_file` |
| **Current count** | 0 |
| **Tier** | **Pro only** |

**Purpose:** Upload and store arbitrary files (configs, PDFs, archives, etc.) via Cloudflare R2.

**Key fields:** `fileUrl` (R2 URL), `fileName` (original name), `fileSize` (bytes)

---

### 6. Image

| Property | Value |
|----------|-------|
| **Icon** | `Image` (Lucide) |
| **Color** | `#ec4899` (pink) |
| **ContentType** | `FILE` |
| **Route** | `/items/images` |
| **Seed ID** | `stype_image` |
| **Current count** | 0 |
| **Tier** | **Pro only** |

**Purpose:** Upload and store images (screenshots, diagrams, design assets) via Cloudflare R2. Displayed with image preview in the UI.

**Key fields:** `fileUrl` (R2 URL), `fileName` (original name), `fileSize` (bytes)

---

### 7. Link

| Property | Value |
|----------|-------|
| **Icon** | `Link` (Lucide) |
| **Color** | `#10b981` (emerald) |
| **ContentType** | `URL` |
| **Route** | `/items/links` |
| **Seed ID** | `stype_link` |
| **Current count** | 6 |
| **Tier** | Free |

**Purpose:** Bookmark external URLs with title, description, and tags. Stores the URL in `Item.url`.

**Key fields:** `url` (external URL), `description` (optional context)

---

## Shared Properties (All Types)

Every item, regardless of type, has these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String (cuid)` | Unique identifier |
| `title` | `String` | Display name |
| `description` | `String?` | Optional summary |
| `isFavorite` | `Boolean` | Star toggle |
| `isPinned` | `Boolean` | Pin to top of lists |
| `userId` | `String` | Owner (FK to User) |
| `itemTypeId` | `String` | Type (FK to ItemType) |
| `tags` | `ItemTag[]` | Many-to-many tags |
| `collections` | `ItemCollection[]` | Many-to-many collections |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

---

## Display Differences

| Aspect | TEXT types | FILE types | URL type |
|--------|-----------|------------|----------|
| **Card preview** | Content excerpt (truncated) | Filename + file size | URL display |
| **Border color** | Type color | Type color | Type color |
| **Editor** | Markdown/code editor with syntax highlighting | File upload zone | URL input + description |
| **Language badge** | Shown if `language` is set (Snippet) | N/A | N/A |
| **Pro gate** | No (except future custom types) | Yes (File, Image) | No |

---

## Implementation References

| Concern | File |
|---------|------|
| Prisma schema (Item, ItemType, ContentType) | `prisma/schema.prisma` |
| System type seed data | `prisma/seed.ts` |
| Icon mapping (Lucide components) | `src/lib/icon-map.ts` |
| Sidebar type list | `src/components/dashboard/SidebarContent.tsx` |
| Item card rendering | `src/components/dashboard/ItemCard.tsx` |
| Profile stats per type | `src/app/profile/page.tsx` |

---

## Summary

- **7 system types**, all `isSystem: true`, not editable by users
- **3 content classifications**: TEXT (4 types), FILE (2 types, Pro only), URL (1 type)
- All types share the same `Item` model; unused fields are `null` (e.g., `fileUrl` is null for TEXT items)
- Types are color-coded throughout the UI (card borders, sidebar icons, collection accents)
- Icons sourced from Lucide via a shared `ICON_MAP` in `src/lib/icon-map.ts`
- Custom user types (`isSystem: false`, `userId` set) are supported by the schema but not yet exposed in the UI
