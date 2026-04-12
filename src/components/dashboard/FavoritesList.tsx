'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, FolderOpen } from 'lucide-react'
import { ICON_MAP } from '@/lib/icon-map'
import { useItems } from '@/components/dashboard/ItemsProvider'
import { formatLongDate } from '@/lib/format'
import type { DashboardItem } from '@/lib/db/items'
import type { FavoriteCollection } from '@/lib/db/collections'

type ItemSortKey = 'date' | 'name' | 'type'
type CollectionSortKey = 'date' | 'name'


function SortToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[]
  value: T
  onChange: (key: T) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
            value === opt.key
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function SectionHeader({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 mb-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</span>
      <span className="text-xs text-muted-foreground tabular-nums">({count})</span>
      <div className="ml-auto">{children}</div>
    </div>
  )
}

function ItemRow({ item }: { item: DashboardItem }) {
  const { openItem } = useItems()
  const type = item.itemType
  const Icon = ICON_MAP[type.icon] ?? null

  return (
    <button
      onClick={() => openItem(item.id)}
      className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-left hover:bg-muted/50 transition-colors"
    >
      {Icon && <Icon className="size-3.5 shrink-0" style={{ color: type.color }} />}
      <span className="flex-1 min-w-0 text-sm font-mono truncate">{item.title}</span>
      <span
        className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded"
        style={{ backgroundColor: type.color + '20', color: type.color }}
      >
        {type.name}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground font-mono tabular-nums">
        {formatLongDate(item.updatedAt)}
      </span>
    </button>
  )
}

function CollectionRow({ collection }: { collection: FavoriteCollection }) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
    >
      <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="flex-1 min-w-0 text-sm font-mono truncate">{collection.name}</span>
      <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground tabular-nums">
        {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground font-mono tabular-nums">
        {formatLongDate(collection.updatedAt)}
      </span>
    </Link>
  )
}

const ITEM_SORT_OPTIONS: { key: ItemSortKey; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
]

const COLLECTION_SORT_OPTIONS: { key: CollectionSortKey; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'name', label: 'Name' },
]

function sortItems(items: DashboardItem[], sort: ItemSortKey): DashboardItem[] {
  const sorted = [...items]
  if (sort === 'name') return sorted.sort((a, b) => a.title.localeCompare(b.title))
  if (sort === 'type') return sorted.sort((a, b) => a.itemType.name.localeCompare(b.itemType.name))
  return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

function sortCollections(cols: FavoriteCollection[], sort: CollectionSortKey): FavoriteCollection[] {
  const sorted = [...cols]
  if (sort === 'name') return sorted.sort((a, b) => a.name.localeCompare(b.name))
  return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

interface FavoritesListProps {
  items: DashboardItem[]
  collections: FavoriteCollection[]
}

export function FavoritesList({ items, collections }: FavoritesListProps) {
  const [itemSort, setItemSort] = useState<ItemSortKey>('date')
  const [collectionSort, setCollectionSort] = useState<CollectionSortKey>('date')

  const isEmpty = items.length === 0 && collections.length === 0

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <Star className="size-8 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium">No favorites yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Star items and collections to find them here quickly.
          </p>
        </div>
      </div>
    )
  }

  const sortedItems = sortItems(items, itemSort)
  const sortedCollections = sortCollections(collections, collectionSort)

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <section>
          <SectionHeader title="Items" count={items.length}>
            <SortToggle options={ITEM_SORT_OPTIONS} value={itemSort} onChange={setItemSort} />
          </SectionHeader>
          <div className="divide-y divide-border/40">
            {sortedItems.map(item => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {collections.length > 0 && (
        <section>
          <SectionHeader title="Collections" count={collections.length}>
            <SortToggle options={COLLECTION_SORT_OPTIONS} value={collectionSort} onChange={setCollectionSort} />
          </SectionHeader>
          <div className="divide-y divide-border/40">
            {sortedCollections.map(col => (
              <CollectionRow key={col.id} collection={col} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
