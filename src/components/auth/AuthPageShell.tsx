import { Navbar } from '@/components/homepage/Navbar'

interface AuthPageShellProps {
  subtitle?: string
  children: React.ReactNode
}

export function AuthPageShell({ subtitle, children }: AuthPageShellProps) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center p-4 pt-19">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-1">
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </>
  )
}
