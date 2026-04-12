'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ScrollFadeIn } from './ScrollFadeIn'
import { FREE_FEATURES, PRO_FEATURES } from '@/lib/pricing'
import { BillingIntervalToggle } from '@/components/ui/BillingIntervalToggle'

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
          <div className="flex justify-center">
            <BillingIntervalToggle yearly={yearly} onChange={setYearly} />
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
