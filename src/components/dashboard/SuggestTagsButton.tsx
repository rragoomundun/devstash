'use client'

import { useState } from 'react'
import { Sparkles, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { generateAutoTags } from '@/actions/ai'

interface SuggestTagsButtonProps {
  title: string
  content: string
  currentTags: string
  onTagsUpdate: (tags: string) => void
}

export function SuggestTagsButton({ title, content, currentTags, onTagsUpdate }: SuggestTagsButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  async function handleSuggest() {
    if (!title.trim()) {
      toast.error('Add a title before suggesting tags')
      return
    }
    setIsLoading(true)
    setSuggestions([])

    const result = await generateAutoTags({ title, content })
    setIsLoading(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    const existing = currentTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    const filtered = result.tags.filter(t => !existing.includes(t))

    if (filtered.length === 0) {
      toast.info('No new tag suggestions')
      return
    }

    setSuggestions(filtered)
  }

  function acceptTag(tag: string) {
    const existing = currentTags.split(',').map(t => t.trim()).filter(Boolean)
    if (!existing.map(t => t.toLowerCase()).includes(tag)) {
      existing.push(tag)
    }
    onTagsUpdate(existing.join(', '))
    setSuggestions(s => s.filter(t => t !== tag))
  }

  function rejectTag(tag: string) {
    setSuggestions(s => s.filter(t => t !== tag))
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSuggest}
        disabled={isLoading}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
      >
        <Sparkles className="size-3.5" />
        <span>{isLoading ? 'Suggesting…' : 'Suggest Tags'}</span>
      </button>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs bg-muted rounded-md pl-2 pr-1 py-0.5 text-muted-foreground"
            >
              #{tag}
              <button
                type="button"
                onClick={() => acceptTag(tag)}
                className="text-green-500 hover:text-green-400 transition-colors"
                title="Accept tag"
              >
                <Check className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => rejectTag(tag)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Reject tag"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
