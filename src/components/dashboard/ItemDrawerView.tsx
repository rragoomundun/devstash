import { Tag, FolderOpen, FileText } from 'lucide-react'
import { TEXT_CONTENT_TYPES, LANGUAGE_TYPES } from '@/lib/item-type-utils'
import { formatBytes } from '@/lib/format'
import { CodeEditor } from './CodeEditor'
import { MarkdownEditor } from './MarkdownEditor'
import type { ItemDetail } from '@/lib/db/items'

interface ItemDrawerViewProps {
  item: ItemDetail
}

export function ItemDrawerView({ item }: ItemDrawerViewProps) {
  const typeName = item.itemType.name.toLowerCase()
  const showLanguage = LANGUAGE_TYPES.has(typeName)
  const showUrl = typeName === 'link'
  const showFile = typeName === 'file' || typeName === 'image'
  const showContent = TEXT_CONTENT_TYPES.has(typeName)
  const tags = item.tags.map(t => t.tag.name)
  const itemCollections = item.collections?.map(c => c.collection) ?? []

  return (
    <>
      {showContent && item.content && (
        showLanguage ? (
          <CodeEditor value={item.content} language={item.language ?? undefined} readOnly />
        ) : (
          <MarkdownEditor value={item.content} readOnly />
        )
      )}

      {showUrl && item.url && (
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
              <p className="text-sm font-medium truncate">{item.fileName ?? 'File'}</p>
              {item.fileSize && (
                <p className="text-xs text-muted-foreground">{formatBytes(item.fileSize)}</p>
              )}
            </div>
          </div>
        )
      )}

      {tags.length > 0 && (
        <div className="flex items-start gap-2">
          <Tag className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <span key={tag} className="text-xs bg-muted rounded-md px-2 py-0.5 text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {itemCollections.length > 0 && (
        <div className="flex items-start gap-2">
          <FolderOpen className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {itemCollections.map(col => (
              <span key={col.id} className="text-xs bg-muted rounded-md px-2 py-0.5 text-muted-foreground">
                {col.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
