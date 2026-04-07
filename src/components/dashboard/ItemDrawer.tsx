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
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Clock,
  Tag,
  FolderOpen,
  Save,
  X,
  Download,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { updateItem, deleteItem, toggleItemFavorite, toggleItemPin } from '@/actions/items'
import type { ItemDetail } from '@/lib/db/items'
import { useItemDetail } from '@/hooks/useItemDetail'
import { TEXT_CONTENT_TYPES, LANGUAGE_TYPES } from '@/lib/item-type-utils'
import { CodeEditor } from './CodeEditor'
import { MarkdownEditor } from './MarkdownEditor'
import { CollectionPicker } from './CollectionPicker'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

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
  return formatDate(date)
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

interface EditState {
  title: string
  description: string
  content: string
  url: string
  language: string
  tags: string
  collectionIds: string[]
}

function itemToEditState(item: ItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? '',
    content: item.content ?? '',
    url: item.url ?? '',
    language: item.language ?? '',
    tags: item.tags.map(t => t.tag.name).join(', '),
    collectionIds: item.collections?.map(c => c.collection.id) ?? [],
  }
}

interface ItemDrawerProps {
  itemId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  collections: Collection[]
}

export function ItemDrawer({ itemId, open, onOpenChange, collections }: ItemDrawerProps) {
  const router = useRouter()
  const { item, setItem, error } = useItemDetail(itemId, open)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [isTogglingPin, setIsTogglingPin] = useState(false)

  async function handleTogglePin() {
    if (!item) return
    setIsTogglingPin(true)
    const result = await toggleItemPin(item.id, !item.isPinned)
    setIsTogglingPin(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setItem({ ...item, isPinned: !item.isPinned })
    router.refresh()
  }

  async function handleToggleFavorite() {
    if (!item) return
    setIsTogglingFavorite(true)
    const result = await toggleItemFavorite(item.id, !item.isFavorite)
    setIsTogglingFavorite(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setItem({ ...item, isFavorite: !item.isFavorite })
    router.refresh()
  }
  const [editState, setEditState] = useState<EditState>({
    title: '',
    description: '',
    content: '',
    url: '',
    language: '',
    tags: '',
    collectionIds: [],
  })

  useEffect(() => {
    setIsEditing(false)
  }, [itemId, open])

  function enterEditMode() {
    if (!item) return
    setEditState(itemToEditState(item))
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
  }

  async function handleSave() {
    if (!item) return
    setIsSaving(true)

    const tags = editState.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const result = await updateItem(item.id, {
      title: editState.title,
      description: editState.description || null,
      content: editState.content || null,
      url: editState.url || null,
      language: editState.language || null,
      tags,
      collectionIds: editState.collectionIds,
    })

    setIsSaving(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

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
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setDeleteConfirmOpen(false)
    onOpenChange(false)
    toast.success('Item deleted')
    router.refresh()
  }

  const typeName = item?.itemType.name.toLowerCase() ?? ''
  const showContent = TEXT_CONTENT_TYPES.has(typeName)
  const showLanguage = LANGUAGE_TYPES.has(typeName)
  const showUrl = typeName === 'link'
  const showFile = typeName === 'file' || typeName === 'image'

  const type = item?.itemType
  const Icon = type ? ICON_MAP[type.icon] : null
  const tags = item?.tags.map(t => t.tag.name) ?? []
  const itemCollections = item?.collections?.map(c => c.collection) ?? []

  const inputClass =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'
  const textareaClass = `${inputClass} resize-none`

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        {item ? (
          <>
            <SheetHeader>
              {/* Type badge */}
              <div className="flex items-center gap-1.5">
                {Icon && (
                  <Icon className="size-4 shrink-0" style={{ color: type!.color }} />
                )}
                <span className="text-xs font-medium" style={{ color: type!.color }}>
                  {type!.name}
                </span>
                {!isEditing && item.language && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </div>

              {isEditing ? (
                <input
                  className={inputClass}
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
                  className={textareaClass}
                  rows={2}
                  value={editState.description}
                  onChange={e => setEditState(s => ({ ...s, description: e.target.value }))}
                  placeholder="Description (optional)"
                />
              ) : (
                item.description && (
                  <SheetDescription>{item.description}</SheetDescription>
                )
              )}

              {/* Timestamps — always display only */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  Created {formatDate(item.createdAt as unknown as string)}
                </span>
                <span>Updated {formatRelativeDate(item.updatedAt as unknown as string)}</span>
              </div>
            </SheetHeader>

            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-y border-border">
              {isEditing ? (
                <>
                  <button
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    onClick={handleSave}
                    disabled={isSaving || !editState.title.trim()}
                  >
                    <Save className="size-3.5" />
                    <span>{isSaving ? 'Saving…' : 'Save'}</span>
                  </button>
                  <button
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={cancelEdit}
                    disabled={isSaving}
                  >
                    <X className="size-3.5" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    title={item.isFavorite ? 'Unfavorite' : 'Favorite'}
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                  >
                    <Star
                      className={`size-3.5 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                    />
                    <span>{item.isFavorite ? 'Favorited' : 'Favorite'}</span>
                  </button>
                  <button
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    title={item.isPinned ? 'Unpin' : 'Pin'}
                    onClick={handleTogglePin}
                    disabled={isTogglingPin}
                  >
                    <Pin className={`size-3.5 ${item.isPinned ? 'fill-foreground text-foreground' : ''}`} />
                    <span>{item.isPinned ? 'Pinned' : 'Pin'}</span>
                  </button>
                  <button
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Copy content"
                  >
                    <Copy className="size-3.5" />
                    <span>Copy</span>
                  </button>
                  {showFile && item.fileUrl && (
                    <a
                      href={`/api/download/${item.fileUrl.split('/').slice(-2).join('/')}`}
                      download={item.fileName ?? undefined}
                      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Download file"
                    >
                      <Download className="size-3.5" />
                      <span>Download</span>
                    </a>
                  )}
                  <button
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Edit"
                    onClick={enterEditMode}
                  >
                    <Pencil className="size-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50"
                    title="Delete"
                    onClick={() => setDeleteConfirmOpen(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-4 space-y-4">
              {isEditing ? (
                <>
                  {showContent && (
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Content</label>
                      {showLanguage ? (
                        <CodeEditor
                          value={editState.content}
                          onChange={(val) => setEditState(s => ({ ...s, content: val }))}
                          language={editState.language || undefined}
                        />
                      ) : (
                        <MarkdownEditor
                          value={editState.content}
                          onChange={(val) => setEditState(s => ({ ...s, content: val }))}
                        />
                      )}
                    </div>
                  )}

                  {showLanguage && (
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Language</label>
                      <input
                        className={inputClass}
                        value={editState.language}
                        onChange={e => setEditState(s => ({ ...s, language: e.target.value }))}
                        placeholder="e.g. typescript"
                      />
                    </div>
                  )}

                  {showUrl && (
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">URL</label>
                      <input
                        className={inputClass}
                        type="url"
                        value={editState.url}
                        onChange={e => setEditState(s => ({ ...s, url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Tags (comma-separated)</label>
                    <input
                      className={inputClass}
                      value={editState.tags}
                      onChange={e => setEditState(s => ({ ...s, tags: e.target.value }))}
                      placeholder="react, hooks, typescript"
                    />
                  </div>

                  <CollectionPicker
                    collections={collections}
                    selectedIds={editState.collectionIds}
                    onChange={ids => setEditState(s => ({ ...s, collectionIds: ids }))}
                  />
                </>
              ) : (
                <>
                  {item.content && (
                    showLanguage ? (
                      <CodeEditor
                        value={item.content}
                        language={item.language ?? undefined}
                        readOnly
                      />
                    ) : (
                      <MarkdownEditor value={item.content} readOnly />
                    )
                  )}

                  {item.url && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:underline break-all"
                      >
                        {item.url}
                      </a>
                    </div>
                  )}

                  {showFile && item.fileUrl && (
                    typeName === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.fileUrl}
                        alt={item.fileName ?? 'Image'}
                        className="max-h-96 w-full rounded-lg object-contain bg-muted/30"
                      />
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                        <FileText className="size-8 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.fileName ?? 'File'}
                          </p>
                          {item.fileSize && (
                            <p className="text-xs text-muted-foreground">
                              {item.fileSize < 1024 * 1024
                                ? `${(item.fileSize / 1024).toFixed(1)} KB`
                                : `${(item.fileSize / (1024 * 1024)).toFixed(1)} MB`}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Tag className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-muted rounded-md px-2 py-0.5 text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collections */}
                  {itemCollections.length > 0 && (
                    <div className="flex items-start gap-2">
                      <FolderOpen className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {itemCollections.map(col => (
                          <span
                            key={col.id}
                            className="text-xs bg-muted rounded-md px-2 py-0.5 text-muted-foreground"
                          >
                            {col.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
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
