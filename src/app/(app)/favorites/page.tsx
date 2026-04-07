export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { Star } from 'lucide-react'
import { auth } from '@/auth'
import { getFavoriteItems } from '@/lib/db/items'
import { getFavoriteCollections } from '@/lib/db/collections'
import { FavoritesList } from '@/components/dashboard/FavoritesList'

export default async function FavoritesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const [items, collections] = await Promise.all([
    getFavoriteItems(session.user.id),
    getFavoriteCollections(session.user.id),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-md flex items-center justify-center bg-yellow-500/10">
          <Star className="size-4 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Favorites</h1>
          <p className="text-sm text-muted-foreground">
            {items.length + collections.length} starred{' '}
            {items.length + collections.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <FavoritesList items={items} collections={collections} />
    </div>
  )
}
