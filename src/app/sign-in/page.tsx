'use client'

import { useState, Suspense, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Github } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function SignInForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
  const hasError = !!searchParams.get('error')

  const router = useRouter()
  const toastShown = useRef(false)

  useEffect(() => {
    if (toastShown.current) return
    if (searchParams.get('registered') === 'true') {
      toastShown.current = true
      toast.success('Account created! Check your inbox to verify your email.')
      router.replace('/sign-in')
    } else if (searchParams.get('verified') === 'true') {
      toastShown.current = true
      toast.success('Email verified! You can now sign in.')
      router.replace('/sign-in')
    }
  }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(hasError ? 'Invalid email or password.' : null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    setError(null)
    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    })
    setLoading(false)
    if (result?.error === 'unverified') {
      setError('Please verify your email before signing in. Check your inbox.')
    } else if (result?.error) {
      setError('Invalid email or password.')
    } else {
      window.location.href = callbackUrl
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">DevStash</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
      </div>

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
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => signIn('github', { callbackUrl })}
      >
        <Github className="size-4" />
        Sign in with GitHub
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-foreground hover:underline">
          Register
        </Link>
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  )
}
