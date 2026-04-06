import { prisma } from '@/lib/prisma'
import { ITEMS_PER_PAGE, DASHBOARD_RECENT_ITEMS_LIMIT } from '@/lib/pagination'

export const itemSelect = {
  id: true,
  title: true,
  description: true,
  contentType: true,
  content: true,
  url: true,
  language: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
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
    take: DASHBOARD_RECENT_ITEMS_LIMIT,
    select: itemSelect,
  })
}

export async function getItemsByType(userId: string, typeName: string, page: number) {
  const where = {
    userId,
    itemType: { name: { equals: typeName, mode: 'insensitive' as const } },
  }
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      select: itemSelect,
    }),
    prisma.item.count({ where }),
  ])
  return { items, total }
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

export interface CreateItemData {
  title: string
  description: string | null
  content: string | null
  url: string | null
  language: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  itemTypeId: string
  tags: string[]
  collectionIds: string[]
}

export async function createItem(userId: string, data: CreateItemData) {
  const contentType = data.url ? 'URL' : data.fileUrl ? 'FILE' : 'TEXT'
  return prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      contentType,
      userId,
      itemTypeId: data.itemTypeId,
      tags: {
        create: data.tags.map(name => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
      collections: {
        create: data.collectionIds.map(collectionId => ({ collectionId })),
      },
    },
    select: itemDetailSelect,
  })
}

export interface UpdateItemData {
  title: string
  description: string | null
  content: string | null
  url: string | null
  language: string | null
  tags: string[]
  collectionIds: string[]
}

export async function updateItem(userId: string, itemId: string, data: UpdateItemData) {
  return prisma.item.update({
    where: { id: itemId, userId },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        deleteMany: {},
        create: data.tags.map(name => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
      collections: {
        deleteMany: {},
        create: data.collectionIds.map(collectionId => ({ collectionId })),
      },
    },
    select: itemDetailSelect,
  })
}

export async function getItemFileUrl(userId: string, itemId: string): Promise<string | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { fileUrl: true },
  })
  return item?.fileUrl ?? null
}

export async function deleteItem(userId: string, itemId: string) {
  await prisma.item.delete({
    where: { id: itemId, userId },
  })
}

export async function getAllItemsForSearch(userId: string) {
  return prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      content: true,
      itemType: { select: { name: true, icon: true, color: true } },
    },
  })
}

export type DashboardItem = Awaited<ReturnType<typeof getRecentItems>>[number]
export type ItemDetail = NonNullable<Awaited<ReturnType<typeof getItemById>>>
export type SearchItem = Awaited<ReturnType<typeof getAllItemsForSearch>>[number]
