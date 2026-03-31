# Item CRUD Architecture

> Design document for a unified CRUD system across all 7 item types.

---

## Principles

1. **One dynamic route** — `/items/[slug]` handles all 7 types via a shared page
2. **Mutations in Server Actions** — a single `src/actions/items.ts` file for create, update, delete
3. **Queries in `src/lib/db/`** — server components call query functions directly (no actions for reads)
4. **Type-specific logic lives in components** — actions and queries are type-agnostic; the UI adapts per type

---

## File Structure

```
src/
├── actions/
│   └── items.ts                    # createItem, updateItem, deleteItem, toggleFavorite, togglePin
│
├── lib/
│   ├── db/
│   │   ├── items.ts                # ← EXTEND: getItemsByType, getItemById (+ existing getPinnedItems, getRecentItems)
│   │   └── collections.ts          # (existing, no changes needed)
│   ├── schemas/
│   │   └── item.ts                 # Zod schemas for create/update validation
│   ├── icon-map.ts                 # (existing)
│   ├── prisma.ts                   # (existing)
│   └── utils.ts                    # (existing)
│
├── app/
│   └── items/
│       └── [slug]/
│           └── page.tsx            # Server component — resolves slug → type, fetches items, renders list
│
├── components/
│   ├── dashboard/
│   │   ├── ItemCard.tsx            # (existing, read-only card)
│   │   └── ...                     # (existing dashboard components)
│   └── items/
│       ├── ItemList.tsx            # Client — grid/list of items with empty state
│       ├── ItemDrawer.tsx          # Client — slide-out panel for view/edit/create
│       ├── ItemForm.tsx            # Client — unified form that adapts fields by content type
│       ├── ItemActions.tsx         # Client — delete/favorite/pin action buttons
│       ├── TextEditor.tsx          # Client — Markdown/code editor for TEXT content types
│       └── UrlInput.tsx            # Client — URL input with preview for LINK type
```

---

## Routing: `/items/[slug]`

### Slug Resolution

The sidebar already defines the convention in `SidebarContent.tsx`:

```typescript
function getTypeSlug(name: string) {
  return name.toLowerCase() + 's'
}
```

| Slug | ItemType name | ContentType |
|------|--------------|-------------|
| `snippets` | Snippet | TEXT |
| `prompts` | Prompt | TEXT |
| `commands` | Command | TEXT |
| `notes` | Note | TEXT |
| `files` | File | FILE |
| `images` | Image | FILE |
| `links` | Link | URL |

### Page Component (`src/app/items/[slug]/page.tsx`)

Server component responsibilities:

1. **Resolve slug to ItemType** — strip trailing `s`, capitalize, query `ItemType` by name
2. **Auth guard** — get session, redirect to `/sign-in` if unauthenticated
3. **Fetch items** — call `getItemsByType(userId, itemTypeId)` from `src/lib/db/items.ts`
4. **Render** — pass items + type metadata to `<ItemList>`

```
[slug] → resolveSlug("snippets") → "Snippet"
       → prisma.itemType.findFirst({ where: { name: "Snippet", isSystem: true } })
       → getItemsByType(userId, typeId)
       → <ItemList items={items} itemType={type} />
```

### Slug-to-Type Mapping

Reverse the sidebar convention:

```typescript
function resolveSlug(slug: string): string {
  // "snippets" → "Snippet", "links" → "Link"
  const singular = slug.endsWith('s') ? slug.slice(0, -1) : slug
  return singular.charAt(0).toUpperCase() + singular.slice(1)
}
```

This works for all 7 types. No lookup table needed.

---

## Data Layer: `src/lib/db/items.ts`

### Existing Exports (keep as-is)

```typescript
getPinnedItems(userId: string)     // Dashboard pinned section
getRecentItems(userId: string)     // Dashboard recent section
type DashboardItem                 // Shared item type
```

### New Exports to Add

```typescript
// Fetch all items of a given type for the list page
getItemsByType(userId: string, itemTypeId: string, options?: {
  orderBy?: 'updatedAt' | 'createdAt' | 'title'
  order?: 'asc' | 'desc'
})

// Fetch a single item by ID (for drawer detail view / edit)
getItemById(itemId: string, userId: string)
```

### Select Shape

Extend the existing `itemSelect` (already defined in items.ts) with collection membership for the detail view:

```typescript
const itemDetailSelect = {
  ...itemSelect,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  collections: {
    select: {
      collection: { select: { id: true, name: true } },
    },
  },
}
```

---

## Mutations: `src/actions/items.ts`

All mutations are Server Actions. They validate input with Zod, perform the Prisma operation, and call `revalidatePath`.

### Actions

| Action | Input | Behavior |
|--------|-------|----------|
| `createItem(formData)` | Zod-validated fields | Create item + connect tags (find-or-create) |
| `updateItem(itemId, formData)` | Zod-validated fields | Update item + sync tags |
| `deleteItem(itemId)` | Item ID | Delete item (cascades to ItemTag, ItemCollection) |
| `toggleFavorite(itemId)` | Item ID | Flip `isFavorite` |
| `togglePin(itemId)` | Item ID | Flip `isPinned` |

### Return Pattern

All actions return a consistent shape:

```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

### Revalidation

After mutations, call `revalidatePath` for:
- `/items/[slug]` (the type list page)
- `/dashboard` (stats, pinned, recent sections)

---

## Validation: `src/lib/schemas/item.ts`

### Create Schema

```typescript
const createItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  itemTypeId: z.string().cuid(),
  // TEXT types
  content: z.string().optional(),
  language: z.string().max(50).optional(),
  // URL type
  url: z.string().url().optional(),
  // Tags
  tags: z.array(z.string().max(50)).max(10).optional(),
})
```

### Update Schema

Same as create but all fields optional (partial update), plus required `id`.

### Content Type Validation

Cross-field validation enforced at the action level (not in schema):
- TEXT types: `content` required, `url`/`fileUrl` must be null
- URL type: `url` required, `content`/`fileUrl` must be null
- FILE types: handled separately via upload API route (not Server Action)

---

## Components

### `ItemList` (Client Component)

Receives items array and type metadata from the server component page.

**Responsibilities:**
- Render grid of `ItemCard` components
- "New [Type]" button that opens the drawer in create mode
- Empty state when no items exist
- Future: sorting, filtering, search

**Does NOT do:** Data fetching (receives props from server parent).

### `ItemDrawer` (Client Component)

Slide-out panel (right side) for viewing, creating, and editing items. Uses the existing `Dialog` component (or a new `Sheet` from shadcn/ui).

**Three modes:**
1. **View** — read-only display of item content, tags, collections, metadata
2. **Create** — empty form, pre-filled with the current type
3. **Edit** — form pre-populated with existing item data

**Responsibilities:**
- Render `ItemForm` in create/edit modes
- Render read-only detail view in view mode
- Handle drawer open/close state

### `ItemForm` (Client Component)

Unified form that adapts its fields based on content type.

**Shared fields (all types):**
- Title (text input)
- Description (text input, optional)
- Tags (tag input, comma-separated or chips)

**Type-specific fields:**

| ContentType | Fields Shown |
|-------------|-------------|
| TEXT | `<TextEditor>` + language selector (for Snippet only) |
| URL | `<UrlInput>` (URL text input) |
| FILE | File upload zone (future, requires R2 integration) |

**Submits via:** Server Action (`createItem` or `updateItem`)

### `ItemActions` (Client Component)

Action buttons that appear on cards and in the drawer:
- Favorite toggle (star icon)
- Pin toggle (pin icon)
- Edit (opens drawer in edit mode)
- Delete (confirmation dialog, then `deleteItem` action)

### `TextEditor` (Client Component)

Code/markdown editor for TEXT content types:
- Textarea or code editor (start simple, upgrade to CodeMirror/Monaco later)
- Syntax highlighting in preview mode (via Shiki or Prism)

### `UrlInput` (Client Component)

URL input for LINK type:
- Text input with URL validation
- Optional: link preview (fetch metadata later)

---

## Component Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  /items/[slug]/page.tsx  (Server Component)                     │
│                                                                 │
│  1. resolveSlug("snippets") → "Snippet"                        │
│  2. getSession() → userId                                       │
│  3. getItemsByType(userId, typeId) → items[]                   │
│  4. Render:                                                     │
│     ┌──────────────────────────────────────────────────────┐    │
│     │  <ItemList items={items} itemType={type}>            │    │
│     │    ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│     │    │ ItemCard  │  │ ItemCard  │  │ ItemCard  │        │    │
│     │    │ + Actions │  │ + Actions │  │ + Actions │        │    │
│     │    └──────────┘  └──────────┘  └──────────┘         │    │
│     │                                                      │    │
│     │    [+ New Snippet] button                            │    │
│     └──────────────────────────────────────────────────────┘    │
│                                                                 │
│     ┌──────────────────────────────────────────────────────┐    │
│     │  <ItemDrawer>  (slide-out panel)                     │    │
│     │    View mode: read-only content + metadata           │    │
│     │    Create/Edit mode: <ItemForm>                      │    │
│     │      ├─ Title, Description, Tags (shared)            │    │
│     │      ├─ <TextEditor> (if TEXT type)                   │    │
│     │      ├─ <UrlInput> (if URL type)                     │    │
│     │      └─ File upload (if FILE type, future)           │    │
│     └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Where Type-Specific Logic Lives

| Concern | Location | Details |
|---------|----------|---------|
| Which fields to show in the form | `ItemForm.tsx` | Switch on `contentType` (TEXT/FILE/URL) |
| Language selector | `ItemForm.tsx` | Only shown when type is "Snippet" |
| File upload UI | `ItemForm.tsx` | Only shown for FILE content type (future) |
| Content preview rendering | `ItemCard.tsx` | Already handles text vs URL display |
| Validation per content type | `src/actions/items.ts` | Cross-field checks after Zod parse |
| Icon and color | `ICON_MAP` + `ItemType.color` | Resolved by item type, no branching needed |
| Route slug | `SidebarContent.tsx` | `getTypeSlug()` — already exists |
| Pro gating | Components | Check `isPro` for File/Image types |

**Key principle:** Actions and queries are type-agnostic. They operate on the `Item` model uniformly. Only the UI layer branches on type to decide which fields/editors to render.

---

## File Upload (FILE types — future)

File and Image types require a separate upload flow that cannot use Server Actions (need streaming, progress tracking, specific headers):

```
src/app/api/upload/route.ts  →  Upload to Cloudflare R2, return { fileUrl, fileName, fileSize }
```

The `ItemForm` for FILE types will:
1. Upload the file via `POST /api/upload`
2. Receive the R2 URL
3. Submit `createItem` action with `fileUrl`, `fileName`, `fileSize` (no `content`)

This keeps the Server Action simple — it just stores the URL, never handles binary data.

---

## Existing Code to Reuse

| Asset | Path | How It's Used |
|-------|------|---------------|
| `itemSelect` | `src/lib/db/items.ts` | Shared select shape for all item queries |
| `DashboardItem` type | `src/lib/db/items.ts` | Reuse for typed item data |
| `ItemCard` | `src/components/dashboard/ItemCard.tsx` | Reuse in `ItemList` (add click handler for drawer) |
| `ICON_MAP` | `src/lib/icon-map.ts` | Resolve icon component from type string |
| `getTypeSlug` | `src/components/dashboard/SidebarContent.tsx` | Slug convention (consider extracting to utils) |
| `Dialog` | `src/components/ui/dialog.tsx` | Base for `ItemDrawer` (or add shadcn Sheet) |
| `Input` | `src/components/ui/input.tsx` | Form fields |
| `Button` | `src/components/ui/button.tsx` | Form submit, action buttons |
| `Badge` | `src/components/ui/badge.tsx` | Tag display |
| `prisma` singleton | `src/lib/prisma.ts` | All DB operations |

---

## Implementation Order

1. **Zod schemas** (`src/lib/schemas/item.ts`) — validation first
2. **DB queries** (`src/lib/db/items.ts`) — add `getItemsByType`, `getItemById`
3. **Server Actions** (`src/actions/items.ts`) — `createItem`, `updateItem`, `deleteItem`, `toggleFavorite`, `togglePin`
4. **Page route** (`src/app/items/[slug]/page.tsx`) — server component with slug resolution
5. **ItemList** — grid display with empty state
6. **ItemDrawer + ItemForm** — create/edit/view in slide-out panel
7. **ItemActions** — favorite, pin, edit, delete buttons
8. **TextEditor / UrlInput** — type-specific input components

Steps 1-3 are backend-only, can be done first. Steps 4-8 build the UI progressively.
