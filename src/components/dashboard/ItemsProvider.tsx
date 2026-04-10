'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { ItemDrawer } from './ItemDrawer'
import { CreateItemDialog } from './CreateItemDialog'
import { CreateCollectionDialog } from './CreateCollectionDialog'
import { CommandPalette } from './CommandPalette'
import type { SearchItem } from '@/lib/db/items'
import { PRO_TYPES } from '@/lib/item-type-utils'
import { FREE_COLLECTION_LIMIT } from '@/lib/usage-limits'

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

interface SearchCollection {
  id: string
  name: string
  itemCount: number
}

interface SearchData {
  items: SearchItem[]
  collections: SearchCollection[]
}

interface ItemsContextValue {
  isPro: boolean
  openItem: (id: string) => void
  openCreate: (typeId?: string) => void
  openCreateCollection: () => void
  openSearch: () => void
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
  searchData: SearchData
  isPro: boolean
}

export function ItemsProvider({ children, itemTypes, collections, searchData, isPro }: ItemsProviderProps) {
  const dialogTypes = isPro ? itemTypes : itemTypes.filter(t => !PRO_TYPES.has(t.name))
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [preselectedTypeId, setPreselectedTypeId] = useState<string | undefined>()
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const openItem = useCallback((id: string) => {
    setSelectedItemId(id)
    setDrawerOpen(true)
  }, [])

  const openCreate = useCallback((typeId?: string) => {
    setPreselectedTypeId(typeId)
    setCreateOpen(true)
  }, [])

  const openCreateCollection = useCallback(() => {
    if (!isPro && collections.length >= FREE_COLLECTION_LIMIT) {
      toast.error(`Free plan is limited to ${FREE_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.`)
      return
    }
    setCreateCollectionOpen(true)
  }, [isPro, collections.length])

  const openSearch = useCallback(() => {
    setSearchOpen(true)
  }, [])

  const handleDrawerOpenChange = useCallback((next: boolean) => {
    setDrawerOpen(next)
    if (!next) setSelectedItemId(null)
  }, [])

  return (
    <ItemsContext value={{ isPro, openItem, openCreate, openCreateCollection, openSearch }}>
      {children}
      <ItemDrawer itemId={selectedItemId} open={drawerOpen} onOpenChange={handleDrawerOpenChange} collections={collections} />
      <CreateItemDialog open={createOpen} onOpenChange={setCreateOpen} itemTypes={dialogTypes} initialTypeId={preselectedTypeId} collections={collections} />
      <CreateCollectionDialog open={createCollectionOpen} onOpenChange={setCreateCollectionOpen} />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} searchData={searchData} onOpenItem={openItem} />
    </ItemsContext>
  )
}
