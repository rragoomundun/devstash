'use client'

import { useState } from 'react'
import { PanelLeft } from 'lucide-react'
import { SidebarContent } from './SidebarContent'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-border shrink-0 transition-[width] duration-200 overflow-hidden',
        collapsed ? 'w-12' : 'w-56'
      )}
    >
      <div
        className={cn(
          'flex items-center border-b border-border h-10 shrink-0',
          collapsed ? 'justify-center px-0' : 'px-3'
        )}
      >
        {!collapsed && (
          <span className="flex-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Navigation
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft className="size-4" />
        </button>
      </div>
      <SidebarContent collapsed={collapsed} />
    </aside>
  )
}
