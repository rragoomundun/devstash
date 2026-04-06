export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getProfileData } from '@/lib/db/profile'
import { ChangePasswordDialog } from '@/components/profile/ChangePasswordDialog'
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const profile = await getProfileData(session.user.id)
  if (!profile) redirect('/sign-in')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      {/* Account section */}
      <section className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-base font-semibold">Account</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account security and preferences</p>
        </div>

        {profile.isCredentials && (
          <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
            </div>
            <ChangePasswordDialog />
          </div>
        )}

        <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-destructive">Delete Account</p>
            <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
          </div>
          <DeleteAccountDialog />
        </div>
      </section>
    </div>
  )
}
