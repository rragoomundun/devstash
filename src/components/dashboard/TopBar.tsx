'use client'

import { Search, Plus, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TopBarProps {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="flex items-center gap-3 border-b border-border px-4 h-14 shrink-0">
      <button
        className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu className="size-5" />
      </button>

      <span className="text-base font-semibold tracking-tight">DevStash</span>

      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search..."
            className="pl-8 h-8 bg-muted border-none text-sm"
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 hidden sm:inline-flex">
          <Plus className="size-4" />
          New Collection
        </Button>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          <span className="hidden sm:inline">New Item</span>
        </Button>
      </div>
    </header>
  )
}
