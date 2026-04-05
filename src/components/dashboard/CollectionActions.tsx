'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Star } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { deleteCollection } from '@/actions/collections'
import { EditCollectionDialog } from '@/components/dashboard/EditCollectionDialog'

interface CollectionActionsProps {
  collection: { id: string; name: string; description: string | null; isFavorite: boolean }
  /** When true, redirect to /collections after delete instead of just refreshing */
  redirectOnDelete?: boolean
}

export function CollectionActions({ collection, redirectOnDelete }: CollectionActionsProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, startDelete] = useTransition()

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

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Edit collection"
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
        <button
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Favorite collection"
          disabled
        >
          <Star className={`size-3.5 ${collection.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          Favorite
        </button>
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
          title="Delete collection"
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{collection.name}&rdquo; will be deleted. Items in this collection will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
