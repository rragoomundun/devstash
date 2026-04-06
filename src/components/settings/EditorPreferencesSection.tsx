'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { useEditorPreferences } from '@/components/dashboard/EditorPreferencesProvider'
import { updateEditorPreferences } from '@/actions/editor-preferences'
import type { EditorPreferences } from '@/types/editor'

const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 18, 20, 24]
const TAB_SIZES = [2, 4, 8]

const THEMES: { value: EditorPreferences['theme']; label: string }[] = [
  { value: 'vs-dark', label: 'VS Dark' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'github-dark', label: 'GitHub Dark' },
]

export function EditorPreferencesSection() {
  const { preferences, setPreferences } = useEditorPreferences()
  const [, startTransition] = useTransition()

  function handleChange(patch: Partial<EditorPreferences>) {
    const next = { ...preferences, ...patch }
    setPreferences(next)
    startTransition(async () => {
      const result = await updateEditorPreferences(next)
      if (result.success) {
        toast.success('Editor preferences saved.')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-6 py-4">
        <h2 className="text-base font-semibold">Editor</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Customize the code editor appearance and behaviour</p>
      </div>

      {/* Theme */}
      <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Theme</p>
          <p className="text-sm text-muted-foreground">Color theme for the code editor</p>
        </div>
        <select
          value={preferences.theme}
          onChange={e => handleChange({ theme: e.target.value as EditorPreferences['theme'] })}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {THEMES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Font size</p>
          <p className="text-sm text-muted-foreground">Editor font size in pixels</p>
        </div>
        <select
          value={preferences.fontSize}
          onChange={e => handleChange({ fontSize: Number(e.target.value) })}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {FONT_SIZES.map(s => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>
      </div>

      {/* Tab size */}
      <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Tab size</p>
          <p className="text-sm text-muted-foreground">Number of spaces per tab</p>
        </div>
        <select
          value={preferences.tabSize}
          onChange={e => handleChange({ tabSize: Number(e.target.value) })}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {TAB_SIZES.map(s => (
            <option key={s} value={s}>{s} spaces</option>
          ))}
        </select>
      </div>

      {/* Word wrap */}
      <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Word wrap</p>
          <p className="text-sm text-muted-foreground">Wrap long lines in the editor</p>
        </div>
        <button
          role="switch"
          aria-checked={preferences.wordWrap}
          onClick={() => handleChange({ wordWrap: !preferences.wordWrap })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${preferences.wordWrap ? 'bg-primary' : 'bg-input'}`}
        >
          <span
            className={`pointer-events-none inline-block size-5 rounded-full bg-background shadow-lg transition-transform ${preferences.wordWrap ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      {/* Minimap */}
      <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Minimap</p>
          <p className="text-sm text-muted-foreground">Show the minimap overview on the right</p>
        </div>
        <button
          role="switch"
          aria-checked={preferences.minimap}
          onClick={() => handleChange({ minimap: !preferences.minimap })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${preferences.minimap ? 'bg-primary' : 'bg-input'}`}
        >
          <span
            className={`pointer-events-none inline-block size-5 rounded-full bg-background shadow-lg transition-transform ${preferences.minimap ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>
    </section>
  )
}
