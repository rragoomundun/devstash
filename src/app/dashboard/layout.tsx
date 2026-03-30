import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { getSidebarData } from '@/lib/db/collections'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')
  const sidebarData = await getSidebarData(session.user.id)

  return <DashboardShell sidebarData={sidebarData}>{children}</DashboardShell>
}
