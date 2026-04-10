'use client'

import { useState, useEffect } from 'react'
import type { ItemDetail } from '@/lib/db/items'

export function useItemDetail(itemId: string | null, open: boolean) {
  const [item, setItem] = useState<ItemDetail | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!itemId || !open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItem(null)
      setError(false)
      return
    }

    setItem(null)
    setError(false)
    fetch(`/api/items/${itemId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(data => setItem(data))
      .catch(() => setError(true))
  }, [itemId, open])

  return { item, setItem, error }
}
