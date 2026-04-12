'use client'

interface BillingIntervalToggleProps {
  yearly: boolean
  onChange: (yearly: boolean) => void
}

export function BillingIntervalToggle({ yearly, onChange }: BillingIntervalToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-sm cursor-pointer transition-colors ${!yearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
        onClick={() => onChange(false)}
      >
        Monthly
      </span>
      <button
        role="switch"
        aria-checked={yearly}
        aria-label="Toggle billing period"
        onClick={() => onChange(!yearly)}
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
        onClick={() => onChange(true)}
      >
        Yearly
        <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-500 rounded-full text-[11px] font-semibold">
          Save 25%
        </span>
      </span>
    </div>
  )
}
