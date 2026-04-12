'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
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
import { ICON_MAP } from '@/lib/icon-map'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'
import { updateItem, deleteItem, toggleItemFavorite, toggleItemPin } from '@/actions/items'
import { useItemDetail } from '@/hooks/useItemDetail'
import { INPUT_CLASS } from '@/lib/styles'
import { formatLongDate } from '@/lib/format'
import { ItemDrawerActionBar } from './ItemDrawerActionBar'
import { ItemDrawerView } from './ItemDrawerView'
import { ItemDrawerEditForm, type EditState } from './ItemDrawerEditForm'

function formatRelativeDate(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatLongDate(date)
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="size-5 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
      <div className="h-6 w-3/4 rounded bg-muted" />
      <div className="h-4 w-1/2 rounded bg-muted" />
      <div className="h-32 w-full rounded bg-muted" />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded bg-muted" />
        <div className="h-5 w-16 rounded bg-muted" />
      </div>
    </div>
  )
}

interface Collection {
  id: string
  name: string
}

interface ItemDrawerProps {
  itemId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  collections: Collection[]
  isPro: boolean
}

function itemToEditState(item: NonNullable<ReturnType<typeof useItemDetail>['item']>): EditState {
  return {
    title: item.title,
    description: item.description ?? '',
    content: item.content ?? '',
    url: item.url ?? '',
    language: item.language ?? 'plaintext',
    tags: item.tags.map(t => t.tag.name).join(', '),
    collectionIds: item.collections?.map(c => c.collection.id) ?? [],
  }
}

export function ItemDrawer({ itemId, open, onOpenChange, collections, isPro }: ItemDrawerProps) {
  const router = useRouter()
  const { item, setItem, error } = useItemDetail(itemId, open)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [isTogglingPin, setIsTogglingPin] = useState(false)
  const [editState, setEditState] = useState<EditState>({
    title: '', description: '', content: '', url: '', language: '', tags: '', collectionIds: [],
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsEditing(false)
  }, [itemId, open])

  async function handleToggleFavorite() {
    if (!item) return
    setIsTogglingFavorite(true)
    const result = await toggleItemFavorite(item.id, !item.isFavorite)
    setIsTogglingFavorite(false)
    if (!result.success) { toast.error(result.error); return }
    setItem({ ...item, isFavorite: !item.isFavorite })
    router.refresh()
  }

  async function handleTogglePin() {
    if (!item) return
    setIsTogglingPin(true)
    const result = await toggleItemPin(item.id, !item.isPinned)
    setIsTogglingPin(false)
    if (!result.success) { toast.error(result.error); return }
    setItem({ ...item, isPinned: !item.isPinned })
    router.refresh()
  }

  function enterEditMode() {
    if (!item) return
    setEditState(itemToEditState(item))
    setIsEditing(true)
  }

  async function handleSave() {
    if (!item) return
    setIsSaving(true)
    const tags = editState.tags.split(',').map(t => t.trim()).filter(Boolean)
    const result = await updateItem(item.id, {
      title: editState.title,
      description: editState.description || null,
      content: editState.content || null,
      url: editState.url || null,
      language: (editState.language && editState.language !== 'plaintext') ? editState.language : null,
      tags,
      collectionIds: editState.collectionIds,
    })
    setIsSaving(false)
    if (!result.success) { toast.error(result.error); return }
    setItem(result.data)
    setIsEditing(false)
    toast.success('Changes saved')
    router.refresh()
  }

  async function handleDelete() {
    if (!item) return
    setIsDeleting(true)
    const result = await deleteItem(item.id)
    setIsDeleting(false)
    if (!result.success) { toast.error(result.error); return }
    setDeleteConfirmOpen(false)
    onOpenChange(false)
    toast.success('Item deleted')
    router.refresh()
  }

  const typeName = item?.itemType.name.toLowerCase() ?? ''
  const showFile = typeName === 'file' || typeName === 'image'
  const type = item?.itemType
  const Icon = type ? ICON_MAP[type.icon] : null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {item ? (
            <>
              <SheetHeader>
                <div className="flex items-center gap-1.5">
                  {Icon && <Icon className="size-4 shrink-0" style={{ color: type!.color }} />}
                  <span className="text-xs font-medium" style={{ color: type!.color }}>{type!.name}</span>
                  {!isEditing && item.language && (
                    <span className="ml-auto text-xs text-muted-foreground">{item.language}</span>
                  )}
                </div>

                {isEditing ? (
                  <input
                    className={INPUT_CLASS}
                    value={editState.title}
                    onChange={e => setEditState(s => ({ ...s, title: e.target.value }))}
                    placeholder="Title"
                    autoFocus
                  />
                ) : (
                  <SheetTitle className="text-lg">{item.title}</SheetTitle>
                )}

                {isEditing ? (
                  <textarea
                    className={`${INPUT_CLASS} resize-none`}
                    rows={2}
                    value={editState.description}
                    onChange={e => setEditState(s => ({ ...s, description: e.target.value }))}
                    placeholder="Description (optional)"
                  />
                ) : (
                  item.description && <SheetDescription>{item.description}</SheetDescription>
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    Created {formatLongDate(item.createdAt as unknown as string)}
                  </span>
                  <span>Updated {formatRelativeDate(item.updatedAt as unknown as string)}</span>
                </div>
              </SheetHeader>

              <ItemDrawerActionBar
                item={item}
                isEditing={isEditing}
                isSaving={isSaving}
                isDeleting={isDeleting}
                isTogglingFavorite={isTogglingFavorite}
                isTogglingPin={isTogglingPin}
                editTitleEmpty={!editState.title.trim()}
                showFile={showFile}
                onSave={handleSave}
                onCancelEdit={() => setIsEditing(false)}
                onToggleFavorite={handleToggleFavorite}
                onTogglePin={handleTogglePin}
                onEdit={enterEditMode}
                onDeleteRequest={() => setDeleteConfirmOpen(true)}
              />

              <div className="flex-1 px-4 py-4 space-y-4">
                {isEditing ? (
                  <ItemDrawerEditForm
                    item={item}
                    editState={editState}
                    setEditState={setEditState}
                    collections={collections}
                    isPro={isPro}
                  />
                ) : (
                  <ItemDrawerView item={item} />
                )}
              </div>
            </>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Item not found</p>
            </div>
          ) : (
            <DrawerSkeleton />
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The item will be permanently deleted.
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
