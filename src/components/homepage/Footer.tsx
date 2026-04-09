import Link from 'next/link'

const LINKS = [
  {
    heading: 'Product',
    items: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    heading: 'Resources',
    items: [
      { label: 'Docs', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-10 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight mb-2.5">
            <span className="text-indigo-500 text-xl">⬡</span>
            DevStash
          </Link>
          <p className="text-sm text-zinc-400 max-w-[200px]">Your developer knowledge hub.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {LINKS.map(col => (
            <div key={col.heading} className="flex flex-col gap-2.5">
              <h4 className="text-[13px] font-semibold mb-1">{col.heading}</h4>
              {col.items.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[13px] text-zinc-400 hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-4 border-t border-white/[0.08]">
        <span className="text-[13px] text-zinc-600">
          © {new Date().getFullYear()} DevStash. All rights reserved.
        </span>
      </div>
    </footer>
  )
}
