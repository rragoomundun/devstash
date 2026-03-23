'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  Clock,
  Lock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { mockItemTypes, mockItems, mockCollections, mockUser } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
}

const PRO_TYPES = new Set(['File', 'Image'])

function getTypeSlug(name: string) {
  return name.toLowerCase() + 's'
}

function getItemCountForType(typeId: string) {
  return mockItems.filter(item => item.itemTypeId === typeId).length
}

export function SidebarContent({ collapsed }: { collapsed?: boolean }) {
  const [collectionsOpen, setCollectionsOpen] = useState(true)

  const favoriteCollections = mockCollections.filter(c => c.isFavorite)
  const recentCollections = [...mockCollections]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
    .filter(c => !c.isFavorite)

  const initials =
    mockUser.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() ?? '?'

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5 min-h-0">

        {/* Types */}
        <div className={cn(!collapsed && 'border-b border-border pb-4')}>
          {!collapsed && (
            <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Types
            </p>
          )}
          <ul className="space-y-0.5">
            {mockItemTypes.map(type => {
              const Icon = ICON_MAP[type.icon]
              const isPro = PRO_TYPES.has(type.name)
              const count = getItemCountForType(type.id)
              const slug = getTypeSlug(type.name)
              return (
                <li key={type.id}>
                  <Link
                    href={`/items/${slug}`}
                    className={cn(
                      'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-foreground/80 hover:text-foreground hover:bg-muted transition-colors',
                      collapsed && 'justify-center px-0'
                    )}
                    title={collapsed ? type.name : undefined}
                  >
                    {Icon && (
                      <Icon className="size-4 shrink-0" style={{ color: type.color }} />
                    )}
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{type.name}</span>
                        {isPro && <Lock className="size-3 text-muted-foreground" />}
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {count}
                        </span>
                      </>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Collections */}
        {!collapsed && (
          <div>
            <button
              onClick={() => setCollectionsOpen(o => !o)}
              className="w-full flex items-center justify-between px-2 mb-1 group"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Collections
              </p>
              {collectionsOpen ? (
                <ChevronDown className="size-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronRight className="size-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>

            {collectionsOpen && (
              <div className="space-y-4">
                {favoriteCollections.length > 0 && (
                  <div>
                    <p className="px-2 mb-1 text-xs font-medium text-muted-foreground">
                      Favorites
                    </p>
                    <ul className="space-y-0.5">
                      {favoriteCollections.map(col => (
                        <li key={col.id}>
                          <Link
                            href={`/collections/${col.id}`}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                            <span className="flex-1 truncate">{col.name}</span>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {col.itemIds.length}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recentCollections.length > 0 && (
                  <div>
                    <p className="px-2 mb-1 text-xs font-medium text-muted-foreground">
                      Recent
                    </p>
                    <ul className="space-y-0.5">
                      {recentCollections.map(col => (
                        <li key={col.id}>
                          <Link
                            href={`/collections/${col.id}`}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate">{col.name}</span>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {col.itemIds.length}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User area */}
      <div className="shrink-0 border-t border-border p-3">
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
          <div className="size-7 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight truncate">{mockUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{mockUser.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
