'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteCollection, toggleCollectionFavorite } from '@/actions/collections'

interface Collection {
  id: string
  name: string
  description: string | null
  isFavorite: boolean
}

export function useCollectionActions(collection: Collection, redirectOnDelete?: boolean) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, startDelete] = useTransition()
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite)
  const [isTogglingFavorite, startToggleFavorite] = useTransition()

  function handleToggleFavorite() {
    startToggleFavorite(async () => {
      const next = !isFavorite
      const result = await toggleCollectionFavorite(collection.id, next)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setIsFavorite(next)
      router.refresh()
    })
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteCollection(collection.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Collection deleted')
      if (redirectOnDelete) {
        router.push('/collections')
      } else {
        router.refresh()
      }
    })
  }

  return {
    isFavorite,
    isDeleting,
    isTogglingFavorite,
    handleToggleFavorite,
    handleDelete,
    deleteOpen,
    setDeleteOpen,
    editOpen,
    setEditOpen,
  }
}
