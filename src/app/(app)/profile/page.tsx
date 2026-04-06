export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { Package, Layers, Calendar } from 'lucide-react'
import { auth } from '@/auth'
import { getProfileData } from '@/lib/db/profile'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ICON_MAP } from '@/lib/icon-map'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const profile = await getProfileData(session.user.id)
  if (!profile) redirect('/sign-in')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

      {/* User info */}
      <section className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-4">
          <UserAvatar name={profile.name} image={profile.image} size={56} />
          <div>
            {profile.name && (
              <p className="text-lg font-medium">{profile.name}</p>
            )}
            {profile.email && (
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4" />
          <span>
            Joined {profile.createdAt.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </section>

      {/* Usage stats */}
      <section className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-medium">Usage</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-muted flex items-center justify-center">
              <Package className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.stats.totalItems}</p>
              <p className="text-xs text-muted-foreground">Items</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-muted flex items-center justify-center">
              <Layers className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.stats.totalCollections}</p>
              <p className="text-xs text-muted-foreground">Collections</p>
            </div>
          </div>
        </div>

        {/* Item type breakdown */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-medium text-muted-foreground">By type</h3>
          <div className="space-y-1.5">
            {profile.stats.byType.map(type => {
              const Icon = ICON_MAP[type.icon]
              return (
                <div key={type.name} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="size-4" style={{ color: type.color }} />}
                    <span className="text-sm">{type.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{type.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
