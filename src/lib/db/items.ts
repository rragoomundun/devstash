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

export async function getItemsByType(userId: string, typeName: string) {
  return prisma.item.findMany({
    where: {
      userId,
      itemType: { name: { equals: typeName, mode: 'insensitive' } },
    },
    orderBy: { updatedAt: 'desc' },
    select: itemSelect,
  })
}

const itemDetailSelect = {
  ...itemSelect,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  collections: {
    include: { collection: { select: { id: true, name: true } } },
  },
} as const

export async function getItemById(userId: string, itemId: string) {
  return prisma.item.findFirst({
    where: { id: itemId, userId },
    select: itemDetailSelect,
  })
}

export type DashboardItem = Awaited<ReturnType<typeof getRecentItems>>[number]
export type ItemDetail = NonNullable<Awaited<ReturnType<typeof getItemById>>>
