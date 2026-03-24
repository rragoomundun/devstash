'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { SidebarContent } from './SidebarContent'
import type { getSidebarData } from '@/lib/db/collections'

type SidebarData = Awaited<ReturnType<typeof getSidebarData>>

export function DashboardShell({ children, sidebarData }: { children: React.ReactNode; sidebarData: SidebarData }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex flex-col h-full min-h-screen">
      <TopBar onMenuClick={() => setMobileOpen(o => !o)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar sidebarData={sidebarData} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {/* Mobile drawer — rendered outside overflow-hidden so fixed positioning is never clipped */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border flex flex-col">
            <div className="flex items-center justify-between px-3 border-b border-border h-14 shrink-0">
              <span className="text-sm font-semibold">DevStash</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <SidebarContent sidebarData={sidebarData} />
          </aside>
        </div>
      )}
    </div>
  )
}
