const TYPES = [
  { label: 'Snippets', color: '#3b82f6', active: true },
  { label: 'Prompts', color: '#f59e0b' },
  { label: 'Commands', color: '#06b6d4' },
  { label: 'Notes', color: '#22c55e' },
  { label: 'Images', color: '#ec4899' },
  { label: 'Links', color: '#6366f1' },
]

const CARDS = [
  { title: 'useDebounce hook', accent: '#3b82f6' },
  { title: 'GPT system prompt', accent: '#f59e0b' },
  { title: 'docker compose up', accent: '#06b6d4' },
  { title: 'API design notes', accent: '#22c55e' },
  { title: 'MDN CSS reference', accent: '#6366f1' },
  { title: 'UI screenshot', accent: '#ec4899' },
]

export function DashboardMockup() {
  return (
    <div className="flex h-full">
      <div className="w-[110px] shrink-0 border-r border-white/[0.08] py-2.5 flex flex-col gap-0.5">
        {TYPES.map(t => (
          <div
            key={t.label}
            className={`flex items-center gap-1.5 px-3 py-1.5 mx-1 rounded text-[10px] ${
              t.active ? 'bg-indigo-500/15 text-foreground' : 'text-zinc-500'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.color }} />
            {t.label}
          </div>
        ))}
      </div>

      <div className="flex-1 p-2.5 overflow-hidden">
        <div className="grid grid-cols-2 gap-1.5">
          {CARDS.map(card => (
            <div
              key={card.title}
              className="bg-zinc-900 border border-white/[0.06] rounded-md p-2"
              style={{ borderTopColor: card.accent, borderTopWidth: 2 }}
            >
              <div className="text-[9px] font-semibold text-foreground mb-1.5 truncate">
                {card.title}
              </div>
              <div className="h-1 bg-white/[0.07] rounded mb-1" />
              <div className="h-1 bg-white/[0.07] rounded w-3/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
