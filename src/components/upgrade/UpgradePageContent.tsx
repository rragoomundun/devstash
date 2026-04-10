'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  { label: 'All item types including files & images', accent: true },
  { label: 'Full-text search', accent: false },
  { label: 'Monaco code editor', accent: false },
  { label: 'AI Auto-Tag, Summary & Explain', accent: true },
  { label: 'File & image uploads (R2)', accent: true },
  { label: 'Export data (JSON / ZIP)', accent: true },
]

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
    try {
      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to start checkout.')
        return
      }
      window.location.href = data.url
    } catch {
      toast.error('Failed to start checkout.')
    } finally {
      setLoading(false)
    }
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
      <div className="flex items-center gap-3">
        <span
          className={`text-sm cursor-pointer transition-colors ${!yearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
          onClick={() => setYearly(false)}
        >
          Monthly
        </span>
        <button
          role="switch"
          aria-checked={yearly}
          aria-label="Toggle billing period"
          onClick={() => setYearly(v => !v)}
          className={`relative w-10 h-5.5 rounded-full border transition-all duration-200 shrink-0 ${
            yearly ? 'bg-primary border-primary' : 'bg-muted border-border'
          }`}
        >
          <span
            className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-200"
            style={{ top: 3, left: 3, transform: yearly ? 'translateX(18px)' : 'translateX(0)' }}
          />
        </button>
        <span
          className={`text-sm cursor-pointer transition-colors flex items-center gap-1.5 ${yearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
          onClick={() => setYearly(true)}
        >
          Yearly
          <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-500 rounded-full text-[11px] font-semibold">
            Save 25%
          </span>
        </span>
      </div>

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
