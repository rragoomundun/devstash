'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { FREE_ITEM_LIMIT, FREE_COLLECTION_LIMIT } from '@/lib/usage-limits'
import { startStripeCheckout } from '@/lib/stripe-client'

interface BillingSectionProps {
  isPro: boolean
  itemCount: number
  collectionCount: number
  monthlyPriceId: string
  yearlyPriceId: string
}

export function BillingSection({ isPro, itemCount, collectionCount, monthlyPriceId, yearlyPriceId }: BillingSectionProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    const priceId = billingInterval === 'monthly' ? monthlyPriceId : yearlyPriceId
    setLoading(true)
    await startStripeCheckout(priceId)
    setLoading(false)
  }

  async function handleManageSubscription() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/customer-portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to open portal.')
        return
      }
      window.location.href = data.url
    } catch {
      toast.error('Failed to open portal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Billing</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your plan and subscription</p>
        </div>
        {isPro && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            Pro
          </span>
        )}
      </div>

      {isPro ? (
        <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Pro Plan</p>
            <p className="text-sm text-muted-foreground">Unlimited items, collections, file uploads, and AI features</p>
          </div>
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="shrink-0 rounded-md px-4 py-2 text-sm font-medium border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Manage Subscription'}
          </button>
        </div>
      ) : (
        <>
          <div className="border-t border-border px-6 py-4 space-y-3">
            <p className="text-sm font-medium">Free Plan</p>

            <div className="space-y-2">
              <UsageBar label="Items" used={itemCount} max={FREE_ITEM_LIMIT} />
              <UsageBar label="Collections" used={collectionCount} max={FREE_COLLECTION_LIMIT} />
            </div>
          </div>

          <div className="border-t border-border px-6 py-4 space-y-4">
            {/* Monthly / Yearly toggle */}
            <div className="flex items-center gap-1 self-start rounded-lg border border-border bg-muted p-1 w-fit">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  billingInterval === 'monthly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  billingInterval === 'yearly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Yearly <span className="text-xs text-emerald-500 font-semibold">−25%</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Upgrade to Pro</p>
                <p className="text-sm text-muted-foreground">
                  {billingInterval === 'monthly' ? '$8 / month' : '$72 / year'} — unlimited everything + AI features
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="shrink-0 rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = Math.min((used / max) * 100, 100)
  const isNearLimit = pct >= 80

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className={isNearLimit ? 'text-amber-500 font-medium' : ''}>
          {used} / {max}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isNearLimit ? 'bg-amber-500' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
