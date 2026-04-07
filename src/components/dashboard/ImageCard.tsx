'use client'

import { Star, Pin } from 'lucide-react'
import { useItems } from '@/components/dashboard/ItemsProvider'
import type { DashboardItem } from '@/lib/db/items'

export function ImageCard({ item }: { item: DashboardItem }) {
  const { openItem } = useItems()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItem(item.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openItem(item.id) }}
      className="group rounded-lg overflow-hidden border border-border bg-card cursor-pointer"
    >
      <div className="overflow-hidden bg-muted max-h-50">
        {item.fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.fileUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No preview
          </div>
        )}
      </div>

      <div className="p-2.5 space-y-0.5">
        <div className="flex items-start gap-1.5">
          <p className="text-sm font-medium leading-tight truncate flex-1">{item.title}</p>
          {item.isFavorite && (
            <Star className="shrink-0 size-3 fill-yellow-400 text-yellow-400 mt-0.5" />
          )}
          {item.isPinned && (
            <Pin className="shrink-0 size-3 fill-foreground text-foreground mt-0.5" />
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        )}
      </div>
    </div>
  )
}
