export const dynamic = 'force-dynamic'

import { Package, Layers, Star, Bookmark } from 'lucide-react'
import { CollectionsGrid } from '@/components/dashboard/CollectionsGrid'
import { PinnedItems } from '@/components/dashboard/PinnedItems'
import { RecentItems } from '@/components/dashboard/RecentItems'
import { getRecentCollections, getDashboardStats } from '@/lib/db/collections'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  // TODO: replace with auth session once NextAuth is set up
  const user = await prisma.user.findFirst({ where: { email: 'demo@devstash.io' } })
  const userId = user?.id ?? ''

  const [collections, stats] = await Promise.all([
    getRecentCollections(userId),
    getDashboardStats(userId),
  ])

  const statCards = [
    { label: 'Items', value: stats.totalItems, Icon: Package },
    { label: 'Collections', value: stats.totalCollections, Icon: Layers },
    { label: 'Favorite Items', value: stats.favoriteItems, Icon: Star },
    { label: 'Favorite Collections', value: stats.favoriteCollections, Icon: Bookmark },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, Icon }) => (
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

      <CollectionsGrid collections={collections} />
      <PinnedItems />
      <RecentItems />
    </div>
  )
}
