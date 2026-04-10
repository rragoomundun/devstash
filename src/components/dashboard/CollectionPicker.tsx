'use client'

import { useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

interface Collection {
  id: string
  name: string
}

interface CollectionPickerProps {
  collections: Collection[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function CollectionPicker({ collections, selectedIds, onChange }: CollectionPickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [width, setWidth] = useState<number | undefined>()

  if (collections.length === 0) return null

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter(c => c !== id)
        : [...selectedIds, id]
    )
  }

  const summary =
    selectedIds.length === 0
      ? 'Select collections…'
      : selectedIds.length === 1
        ? collections.find(c => c.id === selectedIds[0])?.name ?? '1 collection'
        : `${selectedIds.length} collections`

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">Collections</label>
      <DropdownMenu onOpenChange={open => {
        if (open && triggerRef.current) setWidth(triggerRef.current.offsetWidth)
      }}>
        <DropdownMenuTrigger
          ref={triggerRef}
          className="w-full flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        >
          <span className={selectedIds.length === 0 ? 'text-muted-foreground' : 'text-foreground'}>
            {summary}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          style={width ? { width } : undefined}
        >
          {collections.map(col => (
            <DropdownMenuCheckboxItem
              key={col.id}
              checked={selectedIds.includes(col.id)}
              onCheckedChange={() => toggle(col.id)}
              closeOnClick={false}
            >
              {col.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
