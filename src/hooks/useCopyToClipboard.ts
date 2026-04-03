'use client'

import { useState, useCallback } from 'react'

export function useCopyToClipboard(text: string): { copied: boolean; copy: () => void } {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [text])

  return { copied, copy }
}
