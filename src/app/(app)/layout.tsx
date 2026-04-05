import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ItemsProvider } from '@/components/dashboard/ItemsProvider'
import { getSidebarData } from '@/lib/db/collections'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')
  const sidebarData = await getSidebarData(session.user.id)

  const availableTypes = sidebarData.itemTypes
    .map(({ id, name, icon, color }) => ({ id, name, icon, color }))

  return (
    <ItemsProvider itemTypes={availableTypes} collections={sidebarData.collections}>
      <DashboardShell sidebarData={sidebarData}>
        {children}
      </DashboardShell>
    </ItemsProvider>
  )
}
