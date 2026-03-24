import Link from 'next/link'
import { Star } from 'lucide-react'
import type { getRecentCollections } from '@/lib/db/collections'

type Collection = Awaited<ReturnType<typeof getRecentCollections>>[number]

function CollectionCard({ col }: { col: Collection }) {
  return (
    <Link
      href={`/collections/${col.id}`}
      className="group rounded-lg border border-border bg-card flex flex-col gap-2 p-4 hover:bg-muted/30 transition-colors"
      style={{ borderTopColor: col.dominantColor, borderTopWidth: 2 }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm leading-tight">{col.name}</p>
        {col.isFavorite && (
          <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400 mt-0.5" />
        )}
      </div>

      {col.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{col.description}</p>
      )}

      <div className="flex items-center gap-2 mt-auto pt-1">
        <div className="flex items-center gap-1">
          {col.types.map(type => (
            <span
              key={type.id}
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: type.color }}
              title={type.name}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {col.itemCount} {col.itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>
    </Link>
  )
}

export function CollectionsGrid({ collections }: { collections: Collection[] }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Collections
        </h2>
        <Link
          href="/collections"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {collections.map(col => (
          <CollectionCard key={col.id} col={col} />
        ))}
      </div>
    </section>
  )
}
