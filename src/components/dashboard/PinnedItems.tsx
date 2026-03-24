import { ItemCard } from './ItemCard'
import type { DashboardItem } from '@/lib/db/items'

export function PinnedItems({ items }: { items: DashboardItem[] }) {
  if (items.length === 0) return null

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Pinned Items
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(item => (
          <ItemCard key={item.id} item={item} large />
        ))}
      </div>
    </section>
  )
}
