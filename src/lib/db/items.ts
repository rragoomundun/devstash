import { prisma } from '@/lib/prisma'

const itemSelect = {
  id: true,
  title: true,
  description: true,
  contentType: true,
  content: true,
  url: true,
  language: true,
  isPinned: true,
  isFavorite: true,
  updatedAt: true,
  createdAt: true,
  itemType: {
    select: { id: true, name: true, icon: true, color: true },
  },
  tags: {
    include: { tag: { select: { name: true } } },
  },
} as const

export async function getPinnedItems(userId: string) {
  return prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: 'desc' },
    select: itemSelect,
  })
}

export async function getRecentItems(userId: string) {
  return prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    select: itemSelect,
  })
}

export type DashboardItem = Awaited<ReturnType<typeof getRecentItems>>[number]
