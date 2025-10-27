import { DashboardHeader } from '@/components/dashboard/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

