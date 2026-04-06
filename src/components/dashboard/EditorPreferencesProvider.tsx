'use client'

import { createContext, useContext, useState } from 'react'
import type { EditorPreferences } from '@/types/editor'

interface EditorPreferencesContextValue {
  preferences: EditorPreferences
  setPreferences: (prefs: EditorPreferences) => void
}

const EditorPreferencesContext = createContext<EditorPreferencesContextValue | null>(null)

export function EditorPreferencesProvider({
  initialPreferences,
  children,
}: {
  initialPreferences: EditorPreferences
  children: React.ReactNode
}) {
  const [preferences, setPreferences] = useState<EditorPreferences>(initialPreferences)

  return (
    <EditorPreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </EditorPreferencesContext.Provider>
  )
}

export function useEditorPreferences() {
  const ctx = useContext(EditorPreferencesContext)
  if (!ctx) throw new Error('useEditorPreferences must be used within EditorPreferencesProvider')
  return ctx
}
