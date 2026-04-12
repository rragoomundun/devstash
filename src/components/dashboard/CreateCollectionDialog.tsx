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
import { INPUT_CLASS } from '@/lib/styles'
import { Button } from '@/components/ui/button'

interface CreateCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

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
          <Button variant="ghost" className="text-muted-foreground" onClick={() => handleOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
