'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/server-actions/auth-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LogOut } from 'lucide-react'

export function DashboardHeader() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    setIsLoading(true)
    const result = await signOut()
    
    if (result.success) {
      router.push('/login')
      router.refresh()
    } else {
      setIsLoading(false)
      setOpen(false)
      // Handle error if needed
      console.error('Sign out error:', result.error)
    }
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

          {/* Sign out button with confirmation dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border border-neutral-200"
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sign Out</DialogTitle>
                <DialogDescription>
                  Are you sure you want to sign out? You&apos;ll need to sign in again to access your account.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing out...' : 'Sign Out'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}

