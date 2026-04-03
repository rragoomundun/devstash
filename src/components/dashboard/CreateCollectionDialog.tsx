'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { createCollection } from '@/actions/collections'

interface CreateCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const inputClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

export function CreateCollectionDialog({ open, onOpenChange }: CreateCollectionDialogProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName('')
      setDescription('')
    }
    onOpenChange(next)
  }

  async function handleSave() {
    if (!name.trim()) return
    setIsSaving(true)

    const result = await createCollection({ name, description: description || null })

    setIsSaving(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    handleOpenChange(false)
    toast.success('Collection created')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <input
            className={inputClass}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name *"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          />
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
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
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? 'Creating…' : 'Create'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
