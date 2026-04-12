'use client'

import { MoreHorizontal, Pencil, Trash2, Star } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

interface CollectionCardMenuProps {
  collection: { id: string; name: string; description: string | null; isFavorite: boolean }
}

export function CollectionCardMenu({ collection }: CollectionCardMenuProps) {
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
  } = useCollectionActions(collection)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={e => e.preventDefault()}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Collection options"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={e => e.preventDefault()}>
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-3.5 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleToggleFavorite} disabled={isTogglingFavorite}>
            <Star className={`size-3.5 mr-2 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            {isFavorite ? 'Unfavorite' : 'Favorite'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-3.5 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
