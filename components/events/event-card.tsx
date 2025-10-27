import { Event } from '@/lib/server-actions/event-actions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'

interface EventCardProps {
  event: Event
  onEdit: (event: Event) => void
  onDelete: (eventId: string) => void
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const formattedDate = format(new Date(event.event_date), 'MMM d, yyyy, h:mm a')

  return (
    <Card className="border border-neutral-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-base font-normal text-neutral-950">{event.name}</h3>
            <span className="inline-flex items-center rounded-md bg-[#eceef2] px-2.5 py-1.5 text-xs font-medium text-[#030213]">
              {event.sport_type.charAt(0).toUpperCase() + event.sport_type.slice(1)}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(event)} className="gap-2">
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(event.id)}
                className="gap-2 text-destructive"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Date */}
        <div className="flex items-center gap-2 text-base text-[#717182]">
          <Calendar className="size-4" />
          <span>{formattedDate}</span>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-base text-[#717182] line-clamp-2">{event.description}</p>
        )}

        {/* Venues */}
        {event.venues && event.venues.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-base text-[#717182]">
              <MapPin className="size-4" />
              <span>Venues:</span>
            </div>
            <div className="flex flex-wrap gap-2 pl-6">
              {event.venues.map((venue) => (
                <span
                  key={venue.id}
                  className="inline-flex items-center rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-950"
                >
                  {venue.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

