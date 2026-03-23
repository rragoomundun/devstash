import { mockItems } from '@/lib/mock-data'
import { ItemCard } from './ItemCard'

export function PinnedItems() {
  const pinned = mockItems.filter(i => i.isPinned)

  if (pinned.length === 0) return null

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Pinned Items
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {pinned.map(item => (
          <ItemCard key={item.id} item={item} large />
        ))}
      </div>
    </section>
  )
}
