'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthPageShell } from '@/components/auth/AuthPageShell'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setLoading(false)

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }
    if (data.devResetUrl) {
      router.push(data.devResetUrl)
    } else {
      setSubmitted(true)
    }
  }

  return (
    <AuthPageShell subtitle="Reset your password">
      {submitted ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="text-foreground">{email}</span>, you will
              receive a password reset link shortly.
            </p>
            <Link href="/sign-in" className="text-sm text-foreground hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/sign-in" className="text-foreground hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
    </AuthPageShell>
  )
}
