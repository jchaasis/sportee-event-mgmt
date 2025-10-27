import { Event } from '@/lib/server-actions/event-actions'
import { EventCard } from './event-card'

interface EventListProps {
  events: Event[]
  onEdit: (event: Event) => void
  onDelete: (eventId: string) => void
}

export function EventList({ events, onEdit, onDelete }: EventListProps) {
  if (events.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

