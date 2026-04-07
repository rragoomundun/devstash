'use client'

import Link from 'next/link'
import { Star, FolderOpen } from 'lucide-react'
import { ICON_MAP } from '@/lib/icon-map'
import { useItems } from '@/components/dashboard/ItemsProvider'
import type { DashboardItem } from '@/lib/db/items'
import type { FavoriteCollection } from '@/lib/db/collections'

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 mb-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</span>
      <span className="text-xs text-muted-foreground tabular-nums">({count})</span>
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
      className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-left hover:bg-muted/50 transition-colors group"
    >
      {Icon && (
        <Icon className="size-3.5 shrink-0" style={{ color: type.color }} />
      )}
      <span className="flex-1 min-w-0 text-sm font-mono truncate">{item.title}</span>
      <span
        className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded"
        style={{ backgroundColor: type.color + '20', color: type.color }}
      >
        {type.name}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground font-mono tabular-nums">
        {formatDate(item.updatedAt)}
      </span>
    </button>
  )
}

function CollectionRow({ collection }: { collection: FavoriteCollection }) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors group"
    >
      <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="flex-1 min-w-0 text-sm font-mono truncate">{collection.name}</span>
      <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground tabular-nums">
        {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground font-mono tabular-nums">
        {formatDate(collection.updatedAt)}
      </span>
    </Link>
  )
}

interface FavoritesListProps {
  items: DashboardItem[]
  collections: FavoriteCollection[]
}

export function FavoritesList({ items, collections }: FavoritesListProps) {
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

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <section>
          <SectionHeader title="Items" count={items.length} />
          <div className="divide-y divide-border/40">
            {items.map(item => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {collections.length > 0 && (
        <section>
          <SectionHeader title="Collections" count={collections.length} />
          <div className="divide-y divide-border/40">
            {collections.map(col => (
              <CollectionRow key={col.id} collection={col} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
