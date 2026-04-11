'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ICON_MAP } from '@/lib/icon-map'
import { toast } from 'sonner'
import { createItem } from '@/actions/items'
import { TEXT_CONTENT_TYPES, LANGUAGE_TYPES, FILE_CONTENT_TYPES } from '@/lib/item-type-utils'
import { CodeEditor } from './CodeEditor'
import { MarkdownEditor } from './MarkdownEditor'
import { FileUpload } from './FileUpload'
import { CollectionPicker } from './CollectionPicker'

interface ItemType {
  id: string
  name: string
  icon: string
  color: string
}

interface Collection {
  id: string
  name: string
}

interface CreateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemTypes: ItemType[]
  initialTypeId?: string
  collections: Collection[]
}

interface UploadedFile {
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
}

interface FormState {
  title: string
  description: string
  content: string
  url: string
  language: string
  tags: string
}

const emptyForm: FormState = {
  title: '',
  description: '',
  content: '',
  url: '',
  language: '',
  tags: '',
}

export function CreateItemDialog({ open, onOpenChange, itemTypes, initialTypeId, collections }: CreateItemDialogProps) {
  const router = useRouter()
  const [selectedTypeId, setSelectedTypeId] = useState<string>(initialTypeId ?? itemTypes[0]?.id ?? '')
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTypeId(initialTypeId ?? itemTypes[0]?.id ?? '')
      setSelectedCollectionIds([])
    }
  }, [open, initialTypeId, itemTypes])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const selectedType = itemTypes.find(t => t.id === selectedTypeId)
  const typeName = selectedType?.name.toLowerCase() ?? ''
  const showContent = TEXT_CONTENT_TYPES.has(typeName)
  const showLanguage = LANGUAGE_TYPES.has(typeName)
  const showUrl = typeName === 'link'
  const showFile = FILE_CONTENT_TYPES.has(typeName)
  const canSave =
    form.title.trim() !== '' &&
    (!showUrl || form.url.trim() !== '') &&
    (!showFile || uploadedFile !== null)

  function handleTypeChange(id: string) {
    setSelectedTypeId(id)
    setForm(f => ({ ...f, content: '', url: '', language: '' }))
    setUploadedFile(null)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setForm(emptyForm)
      setUploadedFile(null)
      setSelectedTypeId(itemTypes[0]?.id ?? '')
      setSelectedCollectionIds([])
    }
    onOpenChange(next)
  }

  async function handleSave() {
    if (!canSave || !selectedTypeId) return
    setIsSaving(true)

    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)

    const result = await createItem({
      title: form.title,
      description: form.description || null,
      content: form.content || null,
      url: form.url || null,
      language: (form.language && form.language !== 'plaintext') ? form.language : null,
      fileUrl: uploadedFile?.fileUrl ?? null,
      fileName: uploadedFile?.fileName ?? null,
      fileSize: uploadedFile?.fileSize ?? null,
      itemTypeId: selectedTypeId,
      tags,
      collectionIds: selectedCollectionIds,
    })

    setIsSaving(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    handleOpenChange(false)
    toast.success('Item created')
    router.refresh()
  }

  const inputClass =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* Type selector */}
          <Select value={selectedTypeId} onValueChange={(id) => id && handleTypeChange(id)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {selectedType && (() => {
                  const Icon = ICON_MAP[selectedType.icon]
                  return (
                    <span className="flex items-center gap-2">
                      {Icon && <Icon className="size-3.5" style={{ color: selectedType.color }} />}
                      {selectedType.name}
                    </span>
                  )
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {itemTypes.map(type => {
                const Icon = ICON_MAP[type.icon]
                return (
                  <SelectItem key={type.id} value={type.id}>
                    {Icon && <Icon className="size-3.5" style={{ color: type.color }} />}
                    {type.name}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <input
            className={inputClass}
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Title *"
            autoFocus
          />

          <input
            className={inputClass}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)"
          />

          {showContent && (
            showLanguage ? (
              <CodeEditor
                value={form.content}
                onChange={(val) => setForm(f => ({ ...f, content: val }))}
                language={form.language || 'plaintext'}
                onLanguageChange={(lang) => setForm(f => ({ ...f, language: lang }))}
              />
            ) : (
              <MarkdownEditor
                value={form.content}
                onChange={(val) => setForm(f => ({ ...f, content: val }))}
              />
            )
          )}

          {showFile && (
            <FileUpload
              itemType={typeName as 'file' | 'image'}
              value={uploadedFile}
              onChange={setUploadedFile}
            />
          )}

          {showUrl && (
            <input
              className={inputClass}
              type="url"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://... *"
            />
          )}

          <input
            className={inputClass}
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="Tags (comma-separated)"
          />

          <CollectionPicker
            collections={collections}
            selectedIds={selectedCollectionIds}
            onChange={setSelectedCollectionIds}
          />
        </div>

        <DialogFooter>
          <button
            className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            onClick={handleSave}
            disabled={!canSave || isSaving}
          >
            {isSaving ? 'Creating…' : 'Create'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
