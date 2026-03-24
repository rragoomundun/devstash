import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { getSidebarData } from '@/lib/db/collections'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // TODO: replace with auth session once NextAuth is set up
  const user = await prisma.user.findFirst({ where: { email: 'demo@devstash.io' } })
  const sidebarData = await getSidebarData(user?.id ?? '')

  return <DashboardShell sidebarData={sidebarData}>{children}</DashboardShell>
}
