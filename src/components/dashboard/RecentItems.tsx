import Link from 'next/link'
import { mockItems } from '@/lib/mock-data'
import { ItemCard } from './ItemCard'

export function RecentItems() {
  const recent = [...mockItems]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)

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
        {recent.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
