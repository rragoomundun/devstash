'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useItems } from './ItemsProvider'

interface AddTypeItemButtonProps {
  typeId: string
  typeName: string
}

export function AddTypeItemButton({ typeId, typeName }: AddTypeItemButtonProps) {
  const { openCreate } = useItems()

  return (
    <Button size="sm" className="gap-1.5" onClick={() => openCreate(typeId)}>
      <Plus className="size-4" />
      New {typeName}
    </Button>
  )
}
