export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { Star } from 'lucide-react'
import { auth } from '@/auth'
import { getCollectionWithItems } from '@/lib/db/collections'
import { ItemCard } from '@/components/dashboard/ItemCard'
import { ImageCard } from '@/components/dashboard/ImageCard'
import { CollectionActions } from '@/components/dashboard/CollectionActions'

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const { id } = await params
  const collection = await getCollectionWithItems(session.user.id, id)

  if (!collection) notFound()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{collection.name}</h1>
            {collection.isFavorite && (
              <Star className="size-4 fill-amber-400 text-amber-400" />
            )}
          </div>
          {collection.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{collection.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <CollectionActions collection={collection} redirectOnDelete />
      </div>

      {collection.items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {collection.items.map(item =>
            item.itemType.name === 'Image'
              ? <ImageCard key={item.id} item={item} />
              : <ItemCard key={item.id} item={item} />
          )}
        </div>
      )}
    </div>
  )
}
