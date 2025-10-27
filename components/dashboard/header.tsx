import { getCurrentUser } from '@/lib/supabase/auth-helpers'
import { signOut } from '@/lib/server-actions/auth-actions'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export async function DashboardHeader() {
  const user = await getCurrentUser()

  async function handleSignOut() {
    'use server'
    await signOut()
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex h-[60px] items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex size-10 items-center justify-center rounded-[10px] bg-purple-800">
              <svg
                className="size-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>

            {/* Title and greeting */}
            <div>
              <h1 className="text-2xl font-medium text-neutral-950">Sportee</h1>
            </div>
          </div>

          {/* Sign out button */}
          <form action={handleSignOut}>
            <Button
              type="submit"
              variant="outline"
              className="gap-2 border border-neutral-200"
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}

