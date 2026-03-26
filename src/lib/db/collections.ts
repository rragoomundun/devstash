import { prisma } from '@/lib/prisma'

function getDominantColor(itemTypes: { id: string; color: string }[]) {
  if (itemTypes.length === 0) return '#6b7280'
  const counts: Record<string, { color: string; count: number }> = {}
  for (const type of itemTypes) {
    if (!counts[type.id]) counts[type.id] = { color: type.color, count: 0 }
    counts[type.id].count++
  }
  return Object.values(counts).sort((a, b) => b.count - a.count)[0].color
}

export async function getRecentCollections(userId: string) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 6,
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      updatedAt: true,
      createdAt: true,
      _count: { select: { items: true } },
      items: {
        select: {
          item: {
            select: {
              itemType: { select: { id: true, name: true, color: true } },
            },
          },
        },
      },
    },
  })

  return collections.map(col => {
    const itemTypes = col.items.map(ic => ic.item.itemType)
    const dominantColor = getDominantColor(itemTypes)

    const seen = new Set<string>()
    const uniqueTypes = itemTypes
      .filter(t => {
        if (seen.has(t.id)) return false
        seen.add(t.id)
        return true
      })
      .slice(0, 4)

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col._count.items,
      dominantColor,
      types: uniqueTypes,
      updatedAt: col.updatedAt,
      createdAt: col.createdAt,
    }
  })
}

export async function getSidebarData(userId: string) {
  const [itemTypes, collections, user] = await Promise.all([
    prisma.itemType.findMany({
      where: { OR: [{ isSystem: true }, { userId }] },
      orderBy: { name: 'asc' },
      include: { _count: { select: { items: { where: { userId } } } } },
    }),
    prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        isFavorite: true,
        _count: { select: { items: true } },
        items: {
          select: {
            item: {
              select: {
                itemType: { select: { id: true, color: true } },
              },
            },
          },
        },
      },
    }),
    prisma.user.findFirst({ where: { id: userId }, select: { name: true, email: true, image: true } }),
  ])

  const favoriteCollections = collections
    .filter(c => c.isFavorite)
    .map(c => ({ id: c.id, name: c.name, itemCount: c._count.items }))

  const recentCollections = collections
    .filter(c => !c.isFavorite)
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      name: c.name,
      itemCount: c._count.items,
      dominantColor: getDominantColor(c.items.map(ic => ic.item.itemType)),
    }))

  return {
    itemTypes: itemTypes.map(t => ({ id: t.id, name: t.name, icon: t.icon, color: t.color, count: t._count.items })),
    favoriteCollections,
    recentCollections,
    user: user ?? { name: null, email: null, image: null },
  }
}

export async function getDashboardStats(userId: string) {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ])

  return { totalItems, totalCollections, favoriteItems, favoriteCollections }
}
