'use client'

import { TEXT_CONTENT_TYPES, LANGUAGE_TYPES } from '@/lib/item-type-utils'
import { INPUT_CLASS } from '@/lib/styles'
import { CodeEditor } from './CodeEditor'
import { MarkdownEditor } from './MarkdownEditor'
import { CollectionPicker } from './CollectionPicker'
import { SuggestTagsButton } from './SuggestTagsButton'
import type { ItemDetail } from '@/lib/db/items'

export interface EditState {
  title: string
  description: string
  content: string
  url: string
  language: string
  tags: string
  collectionIds: string[]
}

interface Collection {
  id: string
  name: string
}

interface ItemDrawerEditFormProps {
  item: ItemDetail
  editState: EditState
  setEditState: React.Dispatch<React.SetStateAction<EditState>>
  collections: Collection[]
  isPro: boolean
}

export function ItemDrawerEditForm({ item, editState, setEditState, collections, isPro }: ItemDrawerEditFormProps) {
  const typeName = item.itemType.name.toLowerCase()
  const showContent = TEXT_CONTENT_TYPES.has(typeName)
  const showLanguage = LANGUAGE_TYPES.has(typeName)
  const showUrl = typeName === 'link'

  return (
    <>
      {showContent && (
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Content</label>
          {showLanguage ? (
            <CodeEditor
              value={editState.content}
              onChange={val => setEditState(s => ({ ...s, content: val }))}
              language={editState.language || 'plaintext'}
              onLanguageChange={lang => setEditState(s => ({ ...s, language: lang }))}
            />
          ) : (
            <MarkdownEditor
              value={editState.content}
              onChange={val => setEditState(s => ({ ...s, content: val }))}
            />
          )}
        </div>
      )}

      {showUrl && (
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">URL</label>
          <input
            className={INPUT_CLASS}
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
          className={INPUT_CLASS}
          value={editState.tags}
          onChange={e => setEditState(s => ({ ...s, tags: e.target.value }))}
          placeholder="react, hooks, typescript"
        />
        {isPro && (
          <SuggestTagsButton
            title={editState.title}
            content={editState.content}
            currentTags={editState.tags}
            onTagsUpdate={tags => setEditState(s => ({ ...s, tags }))}
          />
        )}
      </div>

      <CollectionPicker
        collections={collections}
        selectedIds={editState.collectionIds}
        onChange={ids => setEditState(s => ({ ...s, collectionIds: ids }))}
      />
    </>
  )
}
