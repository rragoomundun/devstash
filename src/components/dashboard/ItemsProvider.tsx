'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { ItemDrawer } from './ItemDrawer'

interface ItemsContextValue {
  openItem: (id: string) => void
}

const ItemsContext = createContext<ItemsContextValue | null>(null)

export function useItems() {
  const ctx = useContext(ItemsContext)
  if (!ctx) throw new Error('useItems must be used within ItemsProvider')
  return ctx
}

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const openItem = useCallback((id: string) => {
    setSelectedItemId(id)
    setOpen(true)
  }, [])

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (!next) setSelectedItemId(null)
  }, [])

  return (
    <ItemsContext value={{ openItem }}>
      {children}
      <ItemDrawer itemId={selectedItemId} open={open} onOpenChange={handleOpenChange} />
    </ItemsContext>
  )
}
