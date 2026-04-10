'use client'

import { Download, Copy, Check, FileText, FileJson, FileCode, FileSpreadsheet, FileType, Star, Pin, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ICON_MAP } from '@/lib/icon-map'
import { useItems } from '@/components/dashboard/ItemsProvider'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { formatBytes } from '@/lib/format'
import type { DashboardItem } from '@/lib/db/items'

function getFileIcon(fileName: string | null): LucideIcon {
  const ext = fileName?.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return FileType
  if (ext === 'json') return FileJson
  if (['yaml', 'yml', 'toml', 'xml', 'ini'].includes(ext)) return FileCode
  if (ext === 'csv') return FileSpreadsheet
  return FileText
}

function ItemTypeIcon({ contentType, fileName, typeIcon, typeColor }: {
  contentType: string
  fileName: string | null
  typeIcon: string
  typeColor: string
}) {
  const Icon = contentType === 'FILE' ? getFileIcon(fileName) : (ICON_MAP[typeIcon] ?? null)
  if (!Icon) return null
  // eslint-disable-next-line react-hooks/static-components
  return <Icon className="size-3.5 shrink-0" style={{ color: typeColor }} />
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ItemCard({ item, large }: { item: DashboardItem; large?: boolean }) {
  const { openItem } = useItems()
  const { copied, copy } = useCopyToClipboard(item.content ?? item.url ?? '')
  const type = item.itemType
  const tags = item.tags.map(t => t.tag.name)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItem(item.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openItem(item.id) }}
      className={cn(
        'rounded-lg border border-border bg-card flex flex-col gap-3 overflow-hidden cursor-pointer hover:bg-muted/30 transition-colors',
        large ? 'p-4' : 'p-3'
      )}
      style={{ borderLeftColor: type.color, borderLeftWidth: 3 }}
    >
      {/* Type badge */}
      <div className="flex items-center gap-1.5">
        <ItemTypeIcon contentType={item.contentType} fileName={item.fileName} typeIcon={type.icon} typeColor={type.color} />
        <span className="text-xs font-medium" style={{ color: type.color }}>
          {type.name}
        </span>
        {item.language && (
          <span className="ml-auto text-xs text-muted-foreground">{item.language}</span>
        )}
      </div>

      {/* Title + description */}
      <div className="space-y-0.5">
        <p className="text-sm font-semibold leading-tight">{item.title}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
        )}
      </div>

      {/* File metadata */}
      {item.contentType === 'FILE' && (
        <div className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground">
          <div className="min-w-0">
            {item.fileName && (
              <p className="truncate font-mono">{item.fileName}</p>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              {item.fileSize != null && <span>{formatBytes(item.fileSize)}</span>}
              <span>{new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          {item.fileUrl && (
            <a
              href={`/api/download/${item.fileUrl.split('/').slice(-2).join('/')}`}
              download={item.fileName ?? undefined}
              onClick={e => e.stopPropagation()}
              className="shrink-0 rounded-md p-1.5 hover:bg-muted hover:text-foreground transition-colors"
              title="Download"
            >
              <Download className="size-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Content preview */}
      {item.content && (
        <pre
          className={cn('text-xs font-mono bg-muted/50 rounded p-2 overflow-hidden whitespace-pre-wrap break-all', large ? 'max-h-35' : 'max-h-17')}
        >
          {item.content}
        </pre>
      )}
      {item.url && (
        <p className="text-xs text-muted-foreground truncate bg-muted/50 rounded p-2">
          {item.url}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 mt-auto">
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs bg-muted rounded px-1.5 py-0.5 text-muted-foreground whitespace-nowrap"
            >
              #{tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDate(item.updatedAt)}
        </span>
        {(item.content || item.url) && (
          <button
            onClick={e => {
              e.stopPropagation()
              copy()
            }}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Copy"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        )}
        {item.isFavorite && (
          <Star className="shrink-0 size-3 fill-yellow-400 text-yellow-400" />
        )}
        {item.isPinned && (
          <Pin className="shrink-0 size-3 fill-foreground text-foreground" />
        )}
      </div>
    </div>
  )
}
