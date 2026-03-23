import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
} from 'lucide-react'
import { mockItemTypes } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
}

type Item = (typeof import('@/lib/mock-data').mockItems)[number]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ItemCard({ item, large }: { item: Item; large?: boolean }) {
  const type = mockItemTypes.find(t => t.id === item.itemTypeId)
  const Icon = type ? ICON_MAP[type.icon] : null

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card flex flex-col gap-3 overflow-hidden',
        large ? 'p-4' : 'p-3'
      )}
      style={{ borderLeftColor: type?.color, borderLeftWidth: 3 }}
    >
      {/* Type badge */}
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5 shrink-0" style={{ color: type?.color }} />}
        <span className="text-xs font-medium" style={{ color: type?.color }}>
          {type?.name}
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

      {/* Content preview */}
      {item.content && (
        <pre
          className="text-xs font-mono bg-muted/50 rounded p-2 overflow-hidden whitespace-pre-wrap break-all"
          style={{ maxHeight: large ? '140px' : '68px' }}
        >
          {item.content}
        </pre>
      )}
      {'url' in item && item.url && (
        <p className="text-xs text-muted-foreground truncate bg-muted/50 rounded p-2">
          {item.url as string}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 mt-auto">
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {item.tags.slice(0, 3).map(tag => (
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
