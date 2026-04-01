'use client'

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ICON_MAP } from '@/lib/icon-map'
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Clock,
  Tag,
  FolderOpen,
} from 'lucide-react'
import type { ItemDetail } from '@/lib/db/items'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelativeDate(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="size-5 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
      <div className="h-6 w-3/4 rounded bg-muted" />
      <div className="h-4 w-1/2 rounded bg-muted" />
      <div className="h-32 w-full rounded bg-muted" />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded bg-muted" />
        <div className="h-5 w-16 rounded bg-muted" />
      </div>
    </div>
  )
}

interface ItemDrawerProps {
  itemId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!itemId || !open) {
      setItem(null)
      setError(false)
      return
    }

    setItem(null)
    setError(false)
    fetch(`/api/items/${itemId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(data => setItem(data))
      .catch(() => setError(true))
  }, [itemId, open])

  const type = item?.itemType
  const Icon = type ? ICON_MAP[type.icon] : null
  const tags = item?.tags.map(t => t.tag.name) ?? []
  const collections = item?.collections?.map(c => c.collection) ?? []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        {item ? (
          <>
            <SheetHeader>
              {/* Type badge */}
              <div className="flex items-center gap-1.5">
                {Icon && (
                  <Icon className="size-4 shrink-0" style={{ color: type!.color }} />
                )}
                <span className="text-xs font-medium" style={{ color: type!.color }}>
                  {type!.name}
                </span>
                {item.language && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </div>

              <SheetTitle className="text-lg">{item.title}</SheetTitle>

              {item.description && (
                <SheetDescription>{item.description}</SheetDescription>
              )}

              {/* Timestamps */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  Created {formatDate(item.createdAt as unknown as string)}
                </span>
                <span>Updated {formatRelativeDate(item.updatedAt as unknown as string)}</span>
              </div>
            </SheetHeader>

            {/* Action bar */}
            <div className="flex items-center gap-1 px-4 py-2 border-y border-border">
              <button
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title={item.isFavorite ? 'Unfavorite' : 'Favorite'}
              >
                <Star
                  className={`size-3.5 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                />
                <span>{item.isFavorite ? 'Favorited' : 'Favorite'}</span>
              </button>
              <button
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title={item.isPinned ? 'Unpin' : 'Pin'}
              >
                <Pin className={`size-3.5 ${item.isPinned ? 'fill-foreground text-foreground' : ''}`} />
                <span>{item.isPinned ? 'Pinned' : 'Pin'}</span>
              </button>
              <button
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Copy content"
              >
                <Copy className="size-3.5" />
                <span>Copy</span>
              </button>
              <button
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Edit"
              >
                <Pencil className="size-3.5" />
                <span>Edit</span>
              </button>
              <button
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-muted transition-colors ml-auto"
                title="Delete"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-4 space-y-4">
              {item.content && (
                <pre className="text-sm font-mono bg-muted/50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all">
                  {item.content}
                </pre>
              )}

              {item.url && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline break-all"
                  >
                    {item.url}
                  </a>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs bg-muted rounded-md px-2 py-0.5 text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Collections */}
              {collections.length > 0 && (
                <div className="flex items-start gap-2">
                  <FolderOpen className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {collections.map(col => (
                      <span
                        key={col.id}
                        className="text-xs bg-muted rounded-md px-2 py-0.5 text-muted-foreground"
                      >
                        {col.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Item not found</p>
          </div>
        ) : (
          <DrawerSkeleton />
        )}
      </SheetContent>
    </Sheet>
  )
}
