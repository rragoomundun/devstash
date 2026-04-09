import { ScrollFadeIn } from './ScrollFadeIn'

const FEATURES = [
  {
    title: 'Code Snippets',
    description: 'Save reusable code with syntax highlighting, language tagging, and instant copy.',
    accent: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: 'AI Prompts',
    description: 'Store and refine your best system prompts and prompt templates for every AI tool.',
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        <path d="M19 3v4" />
        <path d="M21 5h-4" />
      </svg>
    ),
  },
  {
    title: 'Terminal Commands',
    description: 'Never google the same command twice. Store and search your entire command library.',
    accent: '#06b6d4',
    bg: 'rgba(6,182,212,0.15)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    title: 'Notes & Docs',
    description: 'Write rich Markdown notes with full GFM support — tables, code blocks, and more.',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: 'Instant Search',
    description: 'Find anything in milliseconds with full-text search across all your items and collections.',
    accent: '#6366f1',
    bg: 'rgba(99,102,241,0.15)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    title: 'Collections',
    description: 'Group related items into collections. One item can live in multiple collections.',
    accent: '#64748b',
    bg: 'rgba(100,116,139,0.15)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
  },
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-[100px] bg-zinc-950 border-t border-b border-white/[0.08]"
    >
      <div className="max-w-6xl mx-auto px-6">
        <ScrollFadeIn className="text-center mb-14">
          <h2 className="text-[clamp(24px,4vw,36px)] font-bold tracking-[-0.02em] mb-3">
            Everything a developer needs, in one place
          </h2>
          <p className="text-base text-zinc-400">
            Seven item types built for the way developers actually work.
          </p>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <ScrollFadeIn key={f.title}>
              <div
                className="bg-background border border-white/[0.08] rounded-xl p-7 transition-all duration-200 hover:-translate-y-0.5 group"
                style={{ ['--accent' as string]: f.accent }}
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: f.bg, color: f.accent }}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
