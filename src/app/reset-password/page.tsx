'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthPageShell } from '@/components/auth/AuthPageShell'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!token || !email) {
    return (
      <AuthPageShell>
        <div className="text-center space-y-4">
          <p className="text-sm text-destructive">Invalid or missing reset link.</p>
          <Link href="/forgot-password" className="text-sm text-foreground hover:underline">
            Request a new one
          </Link>
        </div>
      </AuthPageShell>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, password, confirmPassword }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
    } else {
      router.push('/sign-in?reset=true')
    }
  }

  return (
    <AuthPageShell subtitle="Set a new password">
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving…' : 'Set new password'}
        </Button>
      </form>
    </AuthPageShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
