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
import { INPUT_CLASS } from '@/lib/styles'
import { Button } from '@/components/ui/button'

interface EditCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collection: { id: string; name: string; description: string | null }
}

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
            className={INPUT_CLASS}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name *"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          />
          <textarea
            className={`${INPUT_CLASS} resize-none`}
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" className="text-muted-foreground" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
