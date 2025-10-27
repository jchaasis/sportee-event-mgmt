'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Event } from '@/lib/server-actions/event-actions'
import { EventList } from '@/components/events/event-list'
import { EmptyState } from '@/components/events/empty-state'
import { SearchAndFilter } from '@/components/events/search-and-filter'
import { EventDialog } from '@/components/events/event-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [localSearch, setLocalSearch] = useState(search)
  const [localSportType, setLocalSportType] = useState(sportType)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sync local state with initialEvents when it changes (e.g., after refresh)
  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])

  // Sync local search/sport with props when they change
  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  useEffect(() => {
    setLocalSportType(sportType)
  }, [sportType])

  const handleSearchChange = (value: string) => {
    setLocalSearch(value) // Update local state immediately
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
    setLocalSportType(value) // Update local state immediately
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

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return

    setIsDeleting(true)
    const result = await deleteEventAction(eventToDelete)
    
    if (result.success) {
      toast.success('Event deleted successfully')
      setEvents(events.filter((e) => e.id !== eventToDelete))
      router.refresh()
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    } else {
      toast.error(result.error || 'Failed to delete event')
    }
    
    setIsDeleting(false)
  }

  const handleEventSaved = () => {
    // Refresh will update the server data, and useEffect will sync the local state
    router.refresh()
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
        search={localSearch}
        sportType={localSportType}
        onSearchChange={handleSearchChange}
        onSportTypeChange={handleSportTypeChange}
        isLoading={isPending}
      />

      {/* Events List or Empty State */}
      {events.length > 0 ? (
        <EventList events={events} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />
      ) : (
        <EmptyState onCreateEvent={handleCreateEvent} />
      )}

      {/* Event Dialog */}
      <EventDialog event={selectedEvent} open={dialogOpen} onOpenChange={setDialogOpen} onEventSaved={handleEventSaved} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setEventToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteEvent}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

