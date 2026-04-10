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
import { toast } from 'sonner'
import { updateCollection } from '@/actions/collections'

interface EditCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collection: { id: string; name: string; description: string | null }
}

const inputClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

export function EditCollectionDialog({ open, onOpenChange, collection }: EditCollectionDialogProps) {
  const router = useRouter()
  const [name, setName] = useState(collection.name)
  const [description, setDescription] = useState(collection.description ?? '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(collection.name)
      setDescription(collection.description ?? '')
    }
  }, [open, collection])

  async function handleSave() {
    if (!name.trim()) return
    setIsSaving(true)

    const result = await updateCollection(collection.id, { name, description: description || null })

    setIsSaving(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    onOpenChange(false)
    toast.success('Collection updated')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
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
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
