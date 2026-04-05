'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Layers } from 'lucide-react'
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import { ICON_MAP } from '@/lib/icon-map'
import type { SearchItem } from '@/lib/db/items'

interface SearchCollection {
  id: string
  name: string
  itemCount: number
}

interface SearchData {
  items: SearchItem[]
  collections: SearchCollection[]
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchData: SearchData
  onOpenItem: (id: string) => void
}

export function CommandPalette({ open, onOpenChange, searchData, onOpenItem }: CommandPaletteProps) {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onOpenChange])

  function selectItem(id: string) {
    onOpenChange(false)
    onOpenItem(id)
  }

  function selectCollection(id: string) {
    onOpenChange(false)
    router.push(`/collections/${id}`)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search" description="Search items and collections">
      <Command>
      <CommandInput placeholder="Search items and collections…" autoFocus />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {searchData.items.length > 0 && (
          <CommandGroup heading="Items">
            {searchData.items.map(item => {
              const Icon = ICON_MAP[item.itemType.icon]
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.itemType.name}`}
                  onSelect={() => selectItem(item.id)}
                >
                  {Icon && <Icon className="size-4 shrink-0" style={{ color: item.itemType.color }} />}
                  <span className="truncate">{item.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">{item.itemType.name}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        {searchData.items.length > 0 && searchData.collections.length > 0 && (
          <CommandSeparator />
        )}

        {searchData.collections.length > 0 && (
          <CommandGroup heading="Collections">
            {searchData.collections.map(col => (
              <CommandItem
                key={col.id}
                value={col.name}
                onSelect={() => selectCollection(col.id)}
              >
                <Layers className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{col.name}</span>
                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                  {col.itemCount} {col.itemCount === 1 ? 'item' : 'items'}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      </Command>
    </CommandDialog>
  )
}
