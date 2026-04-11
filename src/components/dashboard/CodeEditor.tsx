'use client'

import { useState, useRef, useCallback } from 'react'
import Editor, { type OnMount, type BeforeMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { Copy, Check, ChevronDown } from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useEditorPreferences } from '@/components/dashboard/EditorPreferencesProvider'
import { registerEditorThemes } from '@/lib/editor-themes'
import { LANGUAGES } from '@/lib/languages'

const MIN_HEIGHT = 80
const MAX_HEIGHT = 400

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: string
  onLanguageChange?: (language: string) => void
  readOnly?: boolean
}

export function CodeEditor({ value, onChange, language, onLanguageChange, readOnly = false }: CodeEditorProps) {
  const { copied, copy: handleCopy } = useCopyToClipboard(value)
  const { preferences } = useEditorPreferences()
  const [height, setHeight] = useState(MIN_HEIGHT)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    registerEditorThemes(monaco)
  }, [])

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor

    const updateHeight = () => {
      const contentHeight = editor.getContentHeight()
      setHeight(Math.min(Math.max(contentHeight, MIN_HEIGHT), MAX_HEIGHT))
    }

    updateHeight()
    editor.onDidContentSizeChange(updateHeight)
  }, [])

  const displayLabel = LANGUAGES.find(l => l.value === language)?.label ?? language

  return (
    <div className="rounded-lg overflow-hidden border border-white/10">
      {/* macOS-style header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border-b border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        {onLanguageChange ? (
          <div className="relative ml-2">
            <select
              value={language ?? 'plaintext'}
              onChange={e => onLanguageChange(e.target.value)}
              className="appearance-none bg-transparent text-xs text-zinc-400 font-mono pr-4 focus:outline-none cursor-pointer hover:text-zinc-200 transition-colors"
            >
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value} className="bg-[#1e1e1e] text-zinc-200">
                  {l.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 size-3 text-zinc-500" />
          </div>
        ) : (
          displayLabel && (
            <span className="ml-2 text-xs text-zinc-500 font-mono">{displayLabel}</span>
          )
        )}
        <button
          className="ml-auto flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
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

      {/* Monaco Editor */}
      <Editor
        height={height}
        value={value}
        language={language?.toLowerCase() || 'plaintext'}
        theme={preferences.theme}
        beforeMount={handleBeforeMount}
        onChange={(val) => onChange?.(val ?? '')}
        onMount={handleMount}
        options={{
          readOnly,
          minimap: { enabled: preferences.minimap },
          scrollBeyondLastLine: false,
          lineNumbers: 'off',
          folding: false,
          wordWrap: preferences.wordWrap ? 'on' : 'off',
          fontSize: preferences.fontSize,
          tabSize: preferences.tabSize,
          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: readOnly ? 'none' : 'line',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'hidden',
            verticalScrollbarSize: 5,
            useShadows: false,
          },
          overviewRulerLanes: 0,
          overviewRulerBorder: false,
        }}
      />
    </div>
  )
}
