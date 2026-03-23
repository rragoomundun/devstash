import { Package, Layers, Star, Bookmark } from 'lucide-react'
import { mockItems, mockCollections } from '@/lib/mock-data'
import { CollectionsGrid } from '@/components/dashboard/CollectionsGrid'
import { PinnedItems } from '@/components/dashboard/PinnedItems'
import { RecentItems } from '@/components/dashboard/RecentItems'

const stats = [
  {
    label: 'Items',
    value: mockItems.length,
    Icon: Package,
  },
  {
    label: 'Collections',
    value: mockCollections.length,
    Icon: Layers,
  },
  {
    label: 'Favorite Items',
    value: mockItems.filter(i => i.isFavorite).length,
    Icon: Star,
  },
  {
    label: 'Favorite Collections',
    value: mockCollections.filter(c => c.isFavorite).length,
    Icon: Bookmark,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-4 flex items-center gap-3"
          >
            <div className="size-9 rounded-md bg-muted flex items-center justify-center shrink-0">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <CollectionsGrid />
      <PinnedItems />
      <RecentItems />
    </div>
  )
}
