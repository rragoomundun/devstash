'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
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
} from 'lucide-react'
import { toast } from 'sonner'
import { updateItem } from '@/actions/items'
import type { ItemDetail } from '@/lib/db/items'

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

const TEXT_CONTENT_TYPES = new Set(['snippet', 'prompt', 'command', 'note'])
const LANGUAGE_TYPES = new Set(['snippet', 'command'])

interface EditState {
  title: string
  description: string
  content: string
  url: string
  language: string
  tags: string
}

function itemToEditState(item: ItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? '',
    content: item.content ?? '',
    url: item.url ?? '',
    language: item.language ?? '',
    tags: item.tags.map(t => t.tag.name).join(', '),
  }
}

interface ItemDrawerProps {
  itemId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  const router = useRouter()
  const [item, setItem] = useState<ItemDetail | null>(null)
  const [error, setError] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editState, setEditState] = useState<EditState>({
    title: '',
    description: '',
    content: '',
    url: '',
    language: '',
    tags: '',
  })

  useEffect(() => {
    if (!itemId || !open) {
      setItem(null)
      setError(false)
      setIsEditing(false)
      return
    }

    setItem(null)
    setError(false)
    setIsEditing(false)
    fetch(`/api/items/${itemId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(data => setItem(data))
      .catch(() => setError(true))
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

  const typeName = item?.itemType.name.toLowerCase() ?? ''
  const showContent = TEXT_CONTENT_TYPES.has(typeName)
  const showLanguage = LANGUAGE_TYPES.has(typeName)
  const showUrl = typeName === 'link'

  const type = item?.itemType
  const Icon = type ? ICON_MAP[type.icon] : null
  const tags = item?.tags.map(t => t.tag.name) ?? []
  const collections = item?.collections?.map(c => c.collection) ?? []

  const inputClass =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'
  const textareaClass = `${inputClass} resize-none`

  return (
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
            <div className="flex items-center gap-1 px-4 py-2 border-y border-border">
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
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={item.isFavorite ? 'Unfavorite' : 'Favorite'}
                  >
                    <Star
                      className={`size-3.5 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                    />
                    <span>{item.isFavorite ? 'Favorited' : 'Favorite'}</span>
                  </button>
                  <button
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={item.isPinned ? 'Unpin' : 'Pin'}
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
                  <button
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Edit"
                    onClick={enterEditMode}
                  >
                    <Pencil className="size-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-muted transition-colors ml-auto"
                    title="Delete"
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
                      <textarea
                        className={textareaClass}
                        rows={8}
                        value={editState.content}
                        onChange={e => setEditState(s => ({ ...s, content: e.target.value }))}
                        placeholder="Content"
                      />
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

                  {/* Collections — display only */}
                  {collections.length > 0 && (
                    <div className="flex items-start gap-2">
                      <FolderOpen className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {collections.map(col => (
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
              ) : (
                <>
                  {item.content && (
                    <pre className="text-sm font-mono bg-muted/50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all">
                      {item.content}
                    </pre>
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
                  {collections.length > 0 && (
                    <div className="flex items-start gap-2">
                      <FolderOpen className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {collections.map(col => (
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
  )
}
