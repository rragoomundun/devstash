import Link from 'next/link'
import { ItemCard } from './ItemCard'
import type { DashboardItem } from '@/lib/db/items'

export function RecentItems({ items }: { items: DashboardItem[] }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Recent Items
        </h2>
        <Link
          href="/items"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
