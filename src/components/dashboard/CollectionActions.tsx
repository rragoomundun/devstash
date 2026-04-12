'use client'

import { Star, Pencil, Trash2 } from 'lucide-react'
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
import { EditCollectionDialog } from '@/components/dashboard/EditCollectionDialog'
import { useCollectionActions } from '@/hooks/useCollectionActions'

interface CollectionActionsProps {
  collection: { id: string; name: string; description: string | null; isFavorite: boolean }
  /** When true, redirect to /collections after delete instead of just refreshing */
  redirectOnDelete?: boolean
}

export function CollectionActions({ collection, redirectOnDelete }: CollectionActionsProps) {
  const {
    isFavorite,
    isDeleting,
    isTogglingFavorite,
    handleToggleFavorite,
    handleDelete,
    deleteOpen,
    setDeleteOpen,
    editOpen,
    setEditOpen,
  } = useCollectionActions(collection, redirectOnDelete)

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
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          title={isFavorite ? 'Unfavorite' : 'Favorite'}
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
        >
          <Star className={`size-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          {isFavorite ? 'Favorited' : 'Favorite'}
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

      <EditCollectionDialog open={editOpen} onOpenChange={setEditOpen} collection={collection} />

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
