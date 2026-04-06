export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getAllCollections } from '@/lib/db/collections'
import { CollectionCardMenu } from '@/components/dashboard/CollectionCardMenu'
import { Pagination } from '@/components/dashboard/Pagination'
import { parsePage, pageCount, COLLECTIONS_PER_PAGE } from '@/lib/pagination'

type Collection = Awaited<ReturnType<typeof getAllCollections>>['collections'][number]

function CollectionCard({ col }: { col: Collection }) {
  return (
    <div
      className="group relative rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
      style={{ borderLeftColor: col.dominantColor, borderLeftWidth: 2 }}
    >
      <Link href={`/collections/${col.id}`} className="flex flex-col gap-2 p-4">
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

      <div className="absolute top-2 right-2">
        <CollectionCardMenu collection={col} />
      </div>
    </div>
  )
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const { page: pageParam } = await searchParams
  const page = parsePage(pageParam)

  const { collections, total } = await getAllCollections(session.user.id, page)
  const totalPages = pageCount(total, COLLECTIONS_PER_PAGE)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Collections</h1>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'collection' : 'collections'}
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {collections.map(col => (
            <CollectionCard key={col.id} col={col} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/collections" />
    </div>
  )
}
