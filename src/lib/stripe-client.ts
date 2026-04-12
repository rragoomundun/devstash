import { toast } from 'sonner'

export async function startStripeCheckout(priceId: string): Promise<void> {
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
  }
}
