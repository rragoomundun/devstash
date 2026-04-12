'use client'

import { Star, Pin, Copy, Pencil, Trash2, Save, X, Download } from 'lucide-react'
import type { ItemDetail } from '@/lib/db/items'

interface ItemDrawerActionBarProps {
  item: ItemDetail
  isEditing: boolean
  isSaving: boolean
  isDeleting: boolean
  isTogglingFavorite: boolean
  isTogglingPin: boolean
  editTitleEmpty: boolean
  showFile: boolean
  onSave: () => void
  onCancelEdit: () => void
  onToggleFavorite: () => void
  onTogglePin: () => void
  onEdit: () => void
  onDeleteRequest: () => void
}

export function ItemDrawerActionBar({
  item,
  isEditing,
  isSaving,
  isDeleting,
  isTogglingFavorite,
  isTogglingPin,
  editTitleEmpty,
  showFile,
  onSave,
  onCancelEdit,
  onToggleFavorite,
  onTogglePin,
  onEdit,
  onDeleteRequest,
}: ItemDrawerActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-y border-border">
      {isEditing ? (
        <>
          <button
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            onClick={onSave}
            disabled={isSaving || editTitleEmpty}
          >
            <Save className="size-3.5" />
            <span>{isSaving ? 'Saving…' : 'Save'}</span>
          </button>
          <button
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={onCancelEdit}
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
            onClick={onToggleFavorite}
            disabled={isTogglingFavorite}
          >
            <Star className={`size-3.5 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{item.isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>
          <button
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            title={item.isPinned ? 'Unpin' : 'Pin'}
            onClick={onTogglePin}
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
            onClick={onEdit}
          >
            <Pencil className="size-3.5" />
            <span>Edit</span>
          </button>
          <button
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50"
            title="Delete"
            onClick={onDeleteRequest}
            disabled={isDeleting}
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </button>
        </>
      )}
    </div>
  )
}
