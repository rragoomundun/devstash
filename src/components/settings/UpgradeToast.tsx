'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function UpgradeToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const toastShown = useRef(false)

  useEffect(() => {
    if (toastShown.current) return
    if (searchParams.get('upgraded') === 'true') {
      toastShown.current = true
      toast.success('Welcome to Pro!')
      router.replace('/settings')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only effect: show toast once and clear query params
  }, [])

  return null
}
