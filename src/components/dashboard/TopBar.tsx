'use client'

import Link from 'next/link'
import { Search, Plus, Menu, Star, FolderPlus, FilePlus, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useItems } from './ItemsProvider'

interface TopBarProps {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { isPro, openCreate, openCreateCollection, openSearch } = useItems()

  return (
    <header className="flex items-center gap-3 border-b border-border px-4 h-14 shrink-0">
      <button
        className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu className="size-5" />
      </button>

      <Link href="/dashboard" className="text-base font-semibold tracking-tight">
        <span className="hidden sm:inline">DevStash</span>
        <span className="sm:hidden">DS</span>
      </Link>

      <div className="flex-1 flex justify-center">
        <button
          onClick={openSearch}
          className="relative w-full max-w-sm flex items-center h-8 rounded-md bg-muted px-3 gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        >
          <Search className="size-4 shrink-0" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/favorites"
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Favorites"
        >
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
        </Link>

        {!isPro && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hidden sm:inline-flex" render={<Link href="/upgrade" />}>
            <Zap className="size-3.5" />
            Upgrade
          </Button>
        )}

        {/* Desktop buttons */}
        <Button variant="outline" size="sm" className="gap-1.5 hidden sm:inline-flex" onClick={openCreateCollection}>
          <Plus className="size-4" />
          New Collection
        </Button>
        <Button size="sm" className="gap-1.5 hidden sm:inline-flex" onClick={() => openCreate()}>
          <Plus className="size-4" />
          New Item
        </Button>

        {/* Mobile + dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="sm:hidden p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Create new"
          >
            <Plus className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openCreate()}>
              <FilePlus className="size-4 mr-2" />
              New Item
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openCreateCollection}>
              <FolderPlus className="size-4 mr-2" />
              New Collection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
