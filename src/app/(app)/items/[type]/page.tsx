export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getItemsByType } from '@/lib/db/items'
import { ItemCard } from '@/components/dashboard/ItemCard'
import { ImageCard } from '@/components/dashboard/ImageCard'
import { AddTypeItemButton } from '@/components/dashboard/AddTypeItemButton'
import { Pagination } from '@/components/dashboard/Pagination'
import { ICON_MAP } from '@/lib/icon-map'
import { parsePage, pageCount, ITEMS_PER_PAGE } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'

const SLUG_TO_TYPE: Record<string, string> = {
  snippets: 'Snippet',
  prompts: 'Prompt',
  commands: 'Command',
  notes: 'Note',
  files: 'File',
  images: 'Image',
  links: 'Link',
}

export default async function ItemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const { type: slug } = await params
  const typeName = SLUG_TO_TYPE[slug]
  if (!typeName) notFound()

  if (!session.user.isPro && (slug === 'files' || slug === 'images')) {
    redirect('/upgrade')
  }

  const { page: pageParam } = await searchParams
  const page = parsePage(pageParam)

  const { items, total } = await getItemsByType(session.user.id, typeName, page)
  const totalPages = pageCount(total, ITEMS_PER_PAGE)

  const itemType = items.length > 0
    ? items[0].itemType
    : await prisma.itemType.findFirst({
        where: { name: { equals: typeName, mode: 'insensitive' } },
        select: { id: true, name: true, icon: true, color: true },
      })

  const Icon = itemType ? ICON_MAP[itemType.icon] : null

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        {Icon && itemType && (
          <div
            className="size-9 rounded-md flex items-center justify-center"
            style={{ backgroundColor: itemType.color + '20' }}
          >
            <Icon className="size-4" style={{ color: itemType.color }} />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold">{typeName}s</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'item' : 'items'}
          </p>
        </div>
        {itemType && (
          <div className="ml-auto">
            <AddTypeItemButton typeId={itemType.id} typeName={typeName} />
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No {typeName.toLowerCase()}s yet.
          </p>
        </div>
      ) : slug === 'images' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <ImageCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath={`/items/${slug}`} />
    </div>
  )
}
