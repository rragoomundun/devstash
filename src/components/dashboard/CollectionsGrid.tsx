import Link from 'next/link'
import { Star } from 'lucide-react'
import { mockCollections, mockItems, mockItemTypes } from '@/lib/mock-data'

type Collection = (typeof mockCollections)[number]

function getDominantTypeColor(itemIds: string[]): string {
  const items = mockItems.filter(i => itemIds.includes(i.id))
  if (items.length === 0) return '#6b7280'
  const counts: Record<string, number> = {}
  for (const item of items) {
    counts[item.itemTypeId] = (counts[item.itemTypeId] ?? 0) + 1
  }
  const topTypeId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  return mockItemTypes.find(t => t.id === topTypeId)?.color ?? '#6b7280'
}

function getUniqueTypes(itemIds: string[]) {
  const seen = new Set<string>()
  return mockItems
    .filter(i => itemIds.includes(i.id))
    .filter(item => {
      if (seen.has(item.itemTypeId)) return false
      seen.add(item.itemTypeId)
      return true
    })
    .map(item => mockItemTypes.find(t => t.id === item.itemTypeId))
    .filter((t): t is NonNullable<typeof t> => t !== undefined)
    .slice(0, 4)
}

function CollectionCard({ col }: { col: Collection }) {
  const dominantColor = getDominantTypeColor(col.itemIds)
  const types = getUniqueTypes(col.itemIds)

  return (
    <Link
      href={`/collections/${col.id}`}
      className="group rounded-lg border border-border bg-card flex flex-col gap-2 p-4 hover:bg-muted/30 transition-colors"
      style={{ borderTopColor: dominantColor, borderTopWidth: 2 }}
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
          {types.map(type => (
            <span
              key={type.id}
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: type.color }}
              title={type.name}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {col.itemIds.length} {col.itemIds.length === 1 ? 'item' : 'items'}
        </span>
      </div>
    </Link>
  )
}

export function CollectionsGrid() {
  const sorted = [...mockCollections].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

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
        {sorted.map(col => (
          <CollectionCard key={col.id} col={col} />
        ))}
      </div>
    </section>
  )
}
