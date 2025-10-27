'use client'

import { useState, useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Event } from '@/lib/server-actions/event-actions'
import { eventSchema, SPORT_TYPES, type EventFormData } from '@/lib/validations'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, X } from 'lucide-react'
import { createEvent, updateEvent } from '@/lib/server-actions/event-actions'

interface EventDialogProps {
  event?: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventSaved?: () => void
}

export function EventDialog({ event, open, onOpenChange, onEventSaved }: EventDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [venues, setVenues] = useState<string[]>([])

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as Resolver<EventFormData>,
    defaultValues: {
      name: '',
      sportType: 'soccer',
      eventDate: new Date(),
      description: '',
      venueIds: [],
    },
  })

  // Load event data when editing
  useEffect(() => {
    if (event) {
      form.reset({
        name: event.name,
        sportType: event.sport_type as EventFormData['sportType'],
        eventDate: new Date(event.event_date),
        description: event.description || '',
        venueIds: event.venues?.map(v => v.name) || [],
      })
      setVenues(event.venues?.map(v => v.name) || [])
    } else {
      form.reset({
        name: '',
        sportType: 'soccer',
        eventDate: new Date(),
        description: '',
        venueIds: [],
      })
      setVenues([])
    }
  }, [event, form])

  const addVenue = () => {
    const venueInput = document.getElementById('venue-input') as HTMLInputElement
    const venueName = venueInput?.value.trim()
    if (venueName) {
      const updatedVenues = [...venues, venueName]
      setVenues(updatedVenues)
      form.setValue('venueIds', updatedVenues)
      venueInput.value = ''
    }
  }

  const removeVenue = (index: number) => {
    const updatedVenues = venues.filter((_, i) => i !== index)
    setVenues(updatedVenues)
    form.setValue('venueIds', updatedVenues)
  }

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('sportType', data.sportType)
    formData.append('eventDate', data.eventDate.toISOString())
    formData.append('description', data.description || '')
    venues.forEach((venue) => formData.append('venueIds', venue))

    try {
      let result
      if (event) {
        result = await updateEvent(event.id, formData)
      } else {
        result = await createEvent(formData)
      }

      if (result.success) {
        toast.success(event ? 'Event updated successfully' : 'Event created successfully')
        onEventSaved?.()
        
        // Reset form if creating a new event
        if (!event) {
          form.reset({
            name: '',
            sportType: 'soccer',
            eventDate: new Date(),
            description: '',
            venueIds: [],
          })
          setVenues([])
        }
        
        onOpenChange(false)
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogDescription>
            {event
              ? 'Update the details of your event.'
              : 'Fill in the details to create a new sports event.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Championship Finals" {...field} className="bg-[#f3f3f5] border-0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sport Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#f3f3f5] border-0">
                        <SelectValue placeholder="Select a sport" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SPORT_TYPES.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport.charAt(0).toUpperCase() + sport.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="bg-[#f3f3f5] border-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Event details and additional information..."
                      className="bg-[#f3f3f5] border-0 min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional description of the event</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venueIds"
              render={() => (
                <FormItem>
                  <FormLabel>Venues</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      id="venue-input"
                      placeholder="Enter venue name"
                      className="bg-[#f3f3f5] border-0"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addVenue()
                        }
                      }}
                    />
                    <Button type="button" onClick={addVenue} variant="outline" className="bg-[#eceef2] border-0">
                      <Plus className="size-4" />
                      Add
                    </Button>
                  </div>
                  <FormDescription>Add one or more venues for this event</FormDescription>

                  {/* Venue chips */}
                  {venues.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {venues.map((venue, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded-lg bg-[#eceef2] px-4 py-2"
                        >
                          <span className="text-sm font-medium text-[#030213]">{venue}</span>
                          <button
                            type="button"
                            onClick={() => removeVenue(index)}
                            className="hover:bg-gray-200 rounded p-1"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-purple-800 hover:bg-purple-900">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {event ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  event ? 'Update Event' : 'Create Event'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

