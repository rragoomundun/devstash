import { prisma } from '@/lib/prisma'

export async function getRecentCollections(userId: string) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 6,
    include: {
      items: {
        include: {
          item: {
            include: {
              itemType: {
                select: { id: true, name: true, color: true },
              },
            },
          },
        },
      },
    },
  })

  return collections.map(col => {
    const itemTypes = col.items.map(ic => ic.item.itemType)

    const typeCounts: Record<string, number> = {}
    for (const type of itemTypes) {
      typeCounts[type.id] = (typeCounts[type.id] ?? 0) + 1
    }

    let dominantColor = '#6b7280'
    if (itemTypes.length > 0) {
      const topTypeId = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]
      const topType = itemTypes.find(t => t.id === topTypeId)
      if (topType) dominantColor = topType.color
    }

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
      itemCount: col.items.length,
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
      include: {
        _count: { select: { items: true } },
        items: {
          include: {
            item: {
              include: {
                itemType: { select: { id: true, color: true } },
              },
            },
          },
        },
      },
    }),
    prisma.user.findFirst({ where: { id: userId }, select: { name: true, email: true, image: true } }),
  ])

  function getDominantColor(items: { item: { itemType: { id: string; color: string } } }[]) {
    if (items.length === 0) return '#6b7280'
    const counts: Record<string, { color: string; count: number }> = {}
    for (const { item } of items) {
      const { id, color } = item.itemType
      if (!counts[id]) counts[id] = { color, count: 0 }
      counts[id].count++
    }
    return Object.values(counts).sort((a, b) => b.count - a.count)[0].color
  }

  const favoriteCollections = collections
    .filter(c => c.isFavorite)
    .map(c => ({ id: c.id, name: c.name, itemCount: c._count.items }))

  const recentCollections = collections
    .filter(c => !c.isFavorite)
    .slice(0, 5)
    .map(c => ({ id: c.id, name: c.name, itemCount: c._count.items, dominantColor: getDominantColor(c.items) }))

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
