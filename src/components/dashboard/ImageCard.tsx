'use client'

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
      <div className="aspect-video overflow-hidden bg-muted">
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
        <p className="text-sm font-medium leading-tight truncate">{item.title}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        )}
      </div>
    </div>
  )
}
