import { prisma } from '@/lib/prisma'

export async function getProfileData(userId: string) {
  const [user, totalItems, totalCollections, itemTypeCounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        hashedPassword: true,
        createdAt: true,
        accounts: { select: { provider: true } },
      },
    }),
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { OR: [{ isSystem: true }, { userId }] },
      select: {
        name: true,
        icon: true,
        color: true,
        _count: { select: { items: { where: { userId } } } },
      },
    }),
  ])

  if (!user) return null

  return {
    name: user.name,
    email: user.email,
    image: user.image,
    isCredentials: !!user.hashedPassword,
    createdAt: user.createdAt,
    stats: {
      totalItems,
      totalCollections,
      byType: itemTypeCounts.map(t => ({
        name: t.name,
        icon: t.icon,
        color: t.color,
        count: t._count.items,
      })),
    },
  }
}
