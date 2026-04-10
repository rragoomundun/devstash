import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ItemsProvider } from '@/components/dashboard/ItemsProvider'
import { EditorPreferencesProvider } from '@/components/dashboard/EditorPreferencesProvider'
import { getSidebarData, getCollectionsForSearch } from '@/lib/db/collections'
import { getAllItemsForSearch } from '@/lib/db/items'
import { getEditorPreferences } from '@/actions/editor-preferences'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const [sidebarData, searchItems, searchCollections, editorPreferences] = await Promise.all([
    getSidebarData(session.user.id),
    getAllItemsForSearch(session.user.id),
    getCollectionsForSearch(session.user.id),
    getEditorPreferences(),
  ])

  const availableTypes = sidebarData.itemTypes
    .map(({ id, name, icon, color }) => ({ id, name, icon, color }))

  const searchData = {
    items: searchItems,
    collections: searchCollections,
  }

  return (
    <EditorPreferencesProvider initialPreferences={editorPreferences}>
      <ItemsProvider itemTypes={availableTypes} collections={sidebarData.collections} searchData={searchData} isPro={session.user.isPro}>
        <DashboardShell sidebarData={sidebarData}>
          {children}
        </DashboardShell>
      </ItemsProvider>
    </EditorPreferencesProvider>
  )
}
