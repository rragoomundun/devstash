'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { ItemDrawer } from './ItemDrawer'
import { CreateItemDialog } from './CreateItemDialog'

interface ItemType {
  id: string
  name: string
  icon: string
  color: string
}

interface ItemsContextValue {
  openItem: (id: string) => void
  openCreate: (typeId?: string) => void
}

const ItemsContext = createContext<ItemsContextValue | null>(null)

export function useItems() {
  const ctx = useContext(ItemsContext)
  if (!ctx) throw new Error('useItems must be used within ItemsProvider')
  return ctx
}

interface ItemsProviderProps {
  children: React.ReactNode
  itemTypes: ItemType[]
}

export function ItemsProvider({ children, itemTypes }: ItemsProviderProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [preselectedTypeId, setPreselectedTypeId] = useState<string | undefined>()

  const openItem = useCallback((id: string) => {
    setSelectedItemId(id)
    setDrawerOpen(true)
  }, [])

  const openCreate = useCallback((typeId?: string) => {
    setPreselectedTypeId(typeId)
    setCreateOpen(true)
  }, [])

  const handleDrawerOpenChange = useCallback((next: boolean) => {
    setDrawerOpen(next)
    if (!next) setSelectedItemId(null)
  }, [])

  return (
    <ItemsContext value={{ openItem, openCreate }}>
      {children}
      <ItemDrawer itemId={selectedItemId} open={drawerOpen} onOpenChange={handleDrawerOpenChange} />
      <CreateItemDialog open={createOpen} onOpenChange={setCreateOpen} itemTypes={itemTypes} initialTypeId={preselectedTypeId} />
    </ItemsContext>
  )
}
