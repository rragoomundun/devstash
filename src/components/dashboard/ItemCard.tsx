'use client'

import { Download, FileText, FileJson, FileCode, FileSpreadsheet, FileType, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ICON_MAP } from '@/lib/icon-map'
import { useItems } from '@/components/dashboard/ItemsProvider'
import type { DashboardItem } from '@/lib/db/items'

function getFileIcon(fileName: string | null): LucideIcon {
  const ext = fileName?.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return FileType
  if (ext === 'json') return FileJson
  if (['yaml', 'yml', 'toml', 'xml', 'ini'].includes(ext)) return FileCode
  if (ext === 'csv') return FileSpreadsheet
  return FileText
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ItemCard({ item, large }: { item: DashboardItem; large?: boolean }) {
  const { openItem } = useItems()
  const type = item.itemType
  const Icon = item.contentType === 'FILE' ? getFileIcon(item.fileName) : (ICON_MAP[type.icon] ?? null)
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
        {Icon && <Icon className="size-3.5 shrink-0" style={{ color: type.color }} />}
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
          className={cn('text-xs font-mono bg-muted/50 rounded p-2 overflow-hidden whitespace-pre-wrap break-all', large ? 'max-h-[140px]' : 'max-h-[68px]')}
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
      </div>
    </div>
  )
}
