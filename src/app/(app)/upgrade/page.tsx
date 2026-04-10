import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { UpgradePageContent } from '@/components/upgrade/UpgradePageContent'

export default async function UpgradePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')
  if (session.user.isPro) redirect('/dashboard')

  const monthlyPriceId = process.env.STRIPE_PRICE_ID_MONTHLY ?? ''
  const yearlyPriceId = process.env.STRIPE_PRICE_ID_YEARLY ?? ''

  return (
    <UpgradePageContent
      monthlyPriceId={monthlyPriceId}
      yearlyPriceId={yearlyPriceId}
    />
  )
}
