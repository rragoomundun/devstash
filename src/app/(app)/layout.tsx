import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ItemsProvider } from '@/components/dashboard/ItemsProvider'
import { getSidebarData, getAllCollections } from '@/lib/db/collections'
import { getAllItemsForSearch } from '@/lib/db/items'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const [sidebarData, searchItems, searchCollections] = await Promise.all([
    getSidebarData(session.user.id),
    getAllItemsForSearch(session.user.id),
    getAllCollections(session.user.id),
  ])

  const availableTypes = sidebarData.itemTypes
    .map(({ id, name, icon, color }) => ({ id, name, icon, color }))

  const searchData = {
    items: searchItems,
    collections: searchCollections.map(c => ({ id: c.id, name: c.name, itemCount: c.itemCount })),
  }

  return (
    <ItemsProvider itemTypes={availableTypes} collections={sidebarData.collections} searchData={searchData}>
      <DashboardShell sidebarData={sidebarData}>
        {children}
      </DashboardShell>
    </ItemsProvider>
  )
}
