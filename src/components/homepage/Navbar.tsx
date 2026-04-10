'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${
        scrolled
          ? 'bg-zinc-950/90 border-b border-white/8'
          : 'bg-zinc-950/50 border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-15 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-base shrink-0 tracking-tight">
          <span className="text-indigo-500 text-xl">⬡</span>
          DevStash
        </Link>

        <div className="hidden md:flex gap-6 flex-1">
          <Link href="/#features" className="text-sm text-zinc-400 hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/#pricing" className="text-sm text-zinc-400 hover:text-foreground transition-colors">
            Pricing
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/sign-in" />}>
            Sign In
          </Button>
          <Button size="sm" render={<Link href="/register" />}>
            Get Started
          </Button>
        </div>

        <button
          className="md:hidden ml-auto p-1.5 text-zinc-400 hover:text-foreground transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-4 border-t border-white/8 flex flex-col gap-0.5">
          <Link
            href="/#features"
            className="py-2.5 text-sm text-zinc-400 border-b border-white/8"
            onClick={() => setMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="py-2.5 text-sm text-zinc-400 border-b border-white/8"
            onClick={() => setMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/sign-in"
            className="py-2.5 text-sm text-zinc-400"
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </Link>
          <Button
            size="sm"
            className="mt-2 w-full"
            render={<Link href="/register" onClick={() => setMenuOpen(false)} />}
          >
            Get Started
          </Button>
        </div>
      )}
    </nav>
  )
}
