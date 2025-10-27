import { getEvents } from '@/lib/server-actions/event-actions'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { Suspense } from 'react'

interface DashboardPageProps {
  searchParams: Promise<{
    search?: string
    sport?: string
  }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams
  const search = params.search || ''
  const sportType = params.sport || 'all'

  const eventsResult = await getEvents(search, sportType)

  if (!eventsResult.success) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-red-600">Error loading events: {eventsResult.error}</p>
      </div>
    )
  }

  const events = eventsResult.data || []

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent initialEvents={events} search={search} sportType={sportType} />
    </Suspense>
  )
}

