'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Event } from '@/lib/server-actions/event-actions'
import { EventList } from '@/components/events/event-list'
import { EmptyState } from '@/components/events/empty-state'
import { SearchAndFilter } from '@/components/events/search-and-filter'
import { EventDialog } from '@/components/events/event-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { deleteEvent as deleteEventAction } from '@/lib/server-actions/event-actions'
import { toast } from 'sonner'

interface DashboardContentProps {
  initialEvents: Event[]
  search: string
  sportType: string
}

export function DashboardContent({ initialEvents, search, sportType }: DashboardContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [events, setEvents] = useState(initialEvents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const handleSearchChange = (value: string) => {
    const currentParams = new URLSearchParams(Array.from(searchParams.entries()))
    if (value) {
      currentParams.set('search', value)
    } else {
      currentParams.delete('search')
    }
    startTransition(() => {
      router.push(`/dashboard?${currentParams.toString()}`)
    })
  }

  const handleSportTypeChange = (value: string) => {
    const currentParams = new URLSearchParams(Array.from(searchParams.entries()))
    if (value && value !== 'all') {
      currentParams.set('sport', value)
    } else {
      currentParams.delete('sport')
    }
    startTransition(() => {
      router.push(`/dashboard?${currentParams.toString()}`)
    })
  }

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setDialogOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setDialogOpen(true)
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const result = await deleteEventAction(eventId)
      
      if (result.success) {
        toast.success('Event deleted successfully')
        setEvents(events.filter((e) => e.id !== eventId))
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete event')
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with Create Event button */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-normal text-neutral-950">Sports Events</h2>
        <Button onClick={handleCreateEvent} className="gap-2 bg-purple-800 hover:bg-purple-900 h-9">
          <Plus className="size-4" />
          Create Event
        </Button>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter
        search={search}
        sportType={sportType}
        onSearchChange={handleSearchChange}
        onSportTypeChange={handleSportTypeChange}
      />

      {/* Events List or Empty State */}
      {events.length > 0 ? (
        <EventList events={events} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />
      ) : (
        <EmptyState onCreateEvent={handleCreateEvent} />
      )}

      {/* Event Dialog */}
      <EventDialog event={selectedEvent} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

