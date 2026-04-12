import { ItemCard } from './ItemCard'
import { ImageCard } from './ImageCard'
import type { DashboardItem } from '@/lib/db/items'

interface DashboardItemCardProps {
  item: DashboardItem
  large?: boolean
}

export function DashboardItemCard({ item, large }: DashboardItemCardProps) {
  if (item.itemType.name.toLowerCase() === 'image') {
    return <ImageCard item={item} />
  }
  return <ItemCard item={item} large={large} />
}
