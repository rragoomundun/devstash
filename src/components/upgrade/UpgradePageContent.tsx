'use client'

import { useState } from 'react'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FREE_FEATURES, PRO_FEATURES } from '@/lib/pricing'
import { startStripeCheckout } from '@/lib/stripe-client'
import { BillingIntervalToggle } from '@/components/ui/BillingIntervalToggle'

interface UpgradePageContentProps {
  monthlyPriceId: string
  yearlyPriceId: string
}

export function UpgradePageContent({ monthlyPriceId, yearlyPriceId }: UpgradePageContentProps) {
  const [yearly, setYearly] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    const priceId = yearly ? yearlyPriceId : monthlyPriceId
    setLoading(true)
    await startStripeCheckout(priceId)
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upgrade to Pro</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Unlock unlimited items, AI features, file uploads, and more.
        </p>
      </div>

      {/* Billing toggle */}
      <BillingIntervalToggle yearly={yearly} onChange={setYearly} />

      {/* Pricing cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Free */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Free</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold tracking-tight">$0</span>
              <span className="text-sm text-muted-foreground">forever</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Your current plan</p>
          </div>

          <ul className="space-y-2">
            {FREE_FEATURES.map(f => (
              <li key={f.label} className="flex items-start gap-2.5 text-sm">
                <span className={`mt-0.5 shrink-0 font-bold ${f.included ? 'text-emerald-500' : 'text-muted-foreground/40'}`}>
                  {f.included ? '✓' : '✗'}
                </span>
                <span className={f.included ? '' : 'text-muted-foreground/50'}>{f.label}</span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        </div>

        {/* Pro */}
        <div className="relative rounded-xl border border-primary/40 bg-primary/5 p-6 space-y-5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-[11px] font-semibold rounded-full whitespace-nowrap">
            <Zap className="size-3" />
            Most Popular
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Pro</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold tracking-tight">
                {yearly ? '$6' : '$8'}
              </span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {yearly ? 'Billed $72/year' : 'Billed monthly'}
            </p>
          </div>

          <ul className="space-y-2">
            {PRO_FEATURES.map(f => (
              <li key={f.label} className="flex items-start gap-2.5 text-sm">
                <Check className={`size-4 mt-0.5 shrink-0 ${f.accent ? 'text-primary' : 'text-emerald-500'}`} />
                <span>{f.label}</span>
              </li>
            ))}
          </ul>

          <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
            {loading ? 'Redirecting…' : `Upgrade to Pro`}
          </Button>
        </div>
      </div>
    </div>
  )
}
