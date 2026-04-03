'use client'

import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
}

export function MarkdownEditor({ value, onChange, readOnly = false }: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>(readOnly ? 'preview' : 'write')
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [value])

  return (
    <div className="rounded-lg overflow-hidden border border-white/10">
      {/* Header */}
      <div className="flex items-center bg-[#2d2d2d] border-b border-white/[0.08]">
        {!readOnly && (
          <div className="flex">
            <button
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                tab === 'write'
                  ? 'text-zinc-100 border-b border-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              onClick={() => setTab('write')}
            >
              Write
            </button>
            <button
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                tab === 'preview'
                  ? 'text-zinc-100 border-b border-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              onClick={() => setTab('preview')}
            >
              Preview
            </button>
          </div>
        )}
        <button
          className="ml-auto flex items-center gap-1 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="size-3.5 text-green-400" />
          ) : (
            <Copy className="size-3.5" />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Write tab */}
      {tab === 'write' && !readOnly && (
        <textarea
          className="w-full bg-[#1e1e1e] text-zinc-100 text-sm font-mono px-4 py-3 resize-none focus:outline-none placeholder:text-zinc-600 block min-h-30 max-h-100 overflow-y-auto"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder="Write markdown…"
          spellCheck={false}
        />
      )}

      {/* Preview tab */}
      {(tab === 'preview' || readOnly) && (
        <div
          className="bg-[#1e1e1e] px-4 py-3 overflow-y-auto min-h-20 max-h-100"
        >
          {value.trim() ? (
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-zinc-600 italic">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  )
}
