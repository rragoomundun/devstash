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
import { ICON_MAP } from '@/lib/icon-map'
import { toast } from 'sonner'
import { createItem } from '@/actions/items'
import { CodeEditor } from './CodeEditor'
import { MarkdownEditor } from './MarkdownEditor'

const TEXT_CONTENT_TYPES = new Set(['snippet', 'prompt', 'command', 'note'])
const LANGUAGE_TYPES = new Set(['snippet', 'command'])

interface ItemType {
  id: string
  name: string
  icon: string
  color: string
}

interface CreateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemTypes: ItemType[]
  initialTypeId?: string
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

export function CreateItemDialog({ open, onOpenChange, itemTypes, initialTypeId }: CreateItemDialogProps) {
  const router = useRouter()
  const [selectedTypeId, setSelectedTypeId] = useState<string>(initialTypeId ?? itemTypes[0]?.id ?? '')

  useEffect(() => {
    if (open) setSelectedTypeId(initialTypeId ?? itemTypes[0]?.id ?? '')
  }, [open, initialTypeId, itemTypes])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)

  const selectedType = itemTypes.find(t => t.id === selectedTypeId)
  const typeName = selectedType?.name.toLowerCase() ?? ''
  const showContent = TEXT_CONTENT_TYPES.has(typeName)
  const showLanguage = LANGUAGE_TYPES.has(typeName)
  const showUrl = typeName === 'link'
  const canSave = form.title.trim() !== '' && (!showUrl || form.url.trim() !== '')

  function handleTypeChange(id: string) {
    setSelectedTypeId(id)
    setForm(f => ({ ...f, content: '', url: '', language: '' }))
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setForm(emptyForm)
      setSelectedTypeId(itemTypes[0]?.id ?? '')
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
      language: form.language || null,
      itemTypeId: selectedTypeId,
      tags,
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
          <div className="flex flex-wrap gap-2">
            {itemTypes.map(type => {
              const Icon = ICON_MAP[type.icon]
              const isSelected = type.id === selectedTypeId
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'border-transparent text-background'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                  style={isSelected ? { backgroundColor: type.color } : {}}
                >
                  {Icon && <Icon className="size-3.5" />}
                  {type.name}
                </button>
              )
            })}
          </div>

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
                language={form.language || undefined}
              />
            ) : (
              <MarkdownEditor
                value={form.content}
                onChange={(val) => setForm(f => ({ ...f, content: val }))}
              />
            )
          )}

          {showLanguage && (
            <input
              className={inputClass}
              value={form.language}
              onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
              placeholder="Language (e.g. typescript)"
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
