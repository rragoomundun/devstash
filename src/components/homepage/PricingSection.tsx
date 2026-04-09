'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ScrollFadeIn } from './ScrollFadeIn'

const FREE_FEATURES = [
  { label: 'Up to 50 items', included: true },
  { label: 'Up to 3 collections', included: true },
  { label: 'All item types (except files & images)', included: true },
  { label: 'Basic search', included: true },
  { label: 'Monaco code editor', included: true },
  { label: 'AI features', included: false },
  { label: 'File & image uploads', included: false },
  { label: 'Export data', included: false },
]

const PRO_FEATURES = [
  { label: 'Unlimited items', accent: false },
  { label: 'Unlimited collections', accent: false },
  { label: 'All item types including files & images', accent: false },
  { label: 'Full-text search', accent: false },
  { label: 'Monaco code editor', accent: false },
  { label: 'AI Auto-Tag, Summary & Explain', accent: true },
  { label: 'File & image uploads (R2)', accent: true },
  { label: 'Export data (JSON / ZIP)', accent: true },
]

export function PricingSection() {
  const [yearly, setYearly] = useState(false)

  return (
    <section
      id="pricing"
      className="py-25 bg-zinc-950 border-t border-b border-white/8"
    >
      <div className="max-w-6xl mx-auto px-6">
        <ScrollFadeIn className="text-center mb-14">
          <h2 className="text-[clamp(24px,4vw,36px)] font-bold tracking-[-0.02em] mb-3">
            Simple, honest pricing
          </h2>
          <p className="text-base text-zinc-400 mb-6">Start free. Upgrade when you&apos;re ready.</p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`text-sm cursor-pointer transition-colors ${!yearly ? 'text-foreground font-medium' : 'text-zinc-400'}`}
              onClick={() => setYearly(false)}
            >
              Monthly
            </span>
            <button
              role="switch"
              aria-checked={yearly}
              aria-label="Toggle billing period"
              onClick={() => setYearly(!yearly)}
              className={`relative w-11 h-6 rounded-full border transition-all duration-300 shrink-0 ${
                yearly ? 'bg-indigo-500 border-indigo-500' : 'bg-zinc-800 border-white/8'
              }`}
            >
              <span
                className="absolute w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300"
                style={{ top: 3, left: 3, transform: yearly ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
            <span
              className={`text-sm cursor-pointer transition-colors flex items-center gap-1.5 ${yearly ? 'text-foreground font-medium' : 'text-zinc-400'}`}
              onClick={() => setYearly(true)}
            >
              Yearly
              <span className="px-1.5 py-0.5 bg-green-500/15 text-green-400 rounded-full text-[11px] font-semibold">
                Save 25%
              </span>
            </span>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-190 mx-auto">
            {/* Free */}
            <div className="bg-background border border-white/8 rounded-xl p-9 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="text-base font-semibold text-zinc-400 mb-3">Free</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[42px] font-extrabold tracking-[-0.03em]">$0</span>
                <span className="text-sm text-zinc-400">forever</span>
              </div>
              <div className="h-4 mb-5" />
              <ul className="flex flex-col gap-2.5 mb-7 text-sm">
                {FREE_FEATURES.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    <span className={f.included ? 'text-green-400 font-bold' : 'text-zinc-600'}>
                      {f.included ? '✓' : '✗'}
                    </span>
                    <span className={f.included ? '' : 'text-zinc-500'}>{f.label}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" render={<Link href="/register" />}>
                Get Started Free
              </Button>
            </div>

            {/* Pro */}
            <div className="relative bg-linear-to-br from-indigo-500/6 to-background border border-indigo-500/40 rounded-xl p-9 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-indigo-500 text-white text-[11px] font-semibold rounded-full whitespace-nowrap">
                Most Popular
              </div>
              <div className="text-base font-semibold text-zinc-400 mb-3">Pro</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[42px] font-extrabold tracking-[-0.03em]">
                  {yearly ? '$6' : '$8'}
                </span>
                <span className="text-sm text-zinc-400">/month</span>
              </div>
              <div className="h-4 mb-5">
                {yearly && <p className="text-xs text-zinc-400">Billed $72/year</p>}
              </div>
              <ul className="flex flex-col gap-2.5 mb-7 text-sm">
                {PRO_FEATURES.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    <span className={f.accent ? 'text-indigo-400 font-bold' : 'text-green-400 font-bold'}>✓</span>
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" render={<Link href="/register" />}>
                Start Pro Trial
              </Button>
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  )
}
