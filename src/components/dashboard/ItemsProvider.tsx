'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { ItemDrawer } from './ItemDrawer'
import { CreateItemDialog } from './CreateItemDialog'
import { CreateCollectionDialog } from './CreateCollectionDialog'

interface ItemType {
  id: string
  name: string
  icon: string
  color: string
}

interface Collection {
  id: string
  name: string
}

interface ItemsContextValue {
  openItem: (id: string) => void
  openCreate: (typeId?: string) => void
  openCreateCollection: () => void
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
  collections: Collection[]
}

export function ItemsProvider({ children, itemTypes, collections }: ItemsProviderProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [preselectedTypeId, setPreselectedTypeId] = useState<string | undefined>()
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false)

  const openItem = useCallback((id: string) => {
    setSelectedItemId(id)
    setDrawerOpen(true)
  }, [])

  const openCreate = useCallback((typeId?: string) => {
    setPreselectedTypeId(typeId)
    setCreateOpen(true)
  }, [])

  const openCreateCollection = useCallback(() => {
    setCreateCollectionOpen(true)
  }, [])

  const handleDrawerOpenChange = useCallback((next: boolean) => {
    setDrawerOpen(next)
    if (!next) setSelectedItemId(null)
  }, [])

  return (
    <ItemsContext value={{ openItem, openCreate, openCreateCollection }}>
      {children}
      <ItemDrawer itemId={selectedItemId} open={drawerOpen} onOpenChange={handleDrawerOpenChange} collections={collections} />
      <CreateItemDialog open={createOpen} onOpenChange={setCreateOpen} itemTypes={itemTypes} initialTypeId={preselectedTypeId} collections={collections} />
      <CreateCollectionDialog open={createCollectionOpen} onOpenChange={setCreateCollectionOpen} />
    </ItemsContext>
  )
}
