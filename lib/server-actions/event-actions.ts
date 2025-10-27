'use server'

import { createUserClient, createClient } from '@/lib/supabase/server-client'
import { eventSchema } from '@/lib/validations'
import { ActionResult, createSuccessResult, createErrorResult, handleServerError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export interface Event {
  id: string
  name: string
  sport_type: string
  event_date: string
  description?: string | null
  created_by: string
  created_at: string
  updated_at: string
  venues: Array<{
    id: string
    name: string
    address?: string | null
    capacity?: number | null
  }>
}

export interface EventWithVenues {
  id: string
  name: string
  sport_type: string
  event_date: string
  description?: string | null
  created_by: string
  created_at: string
  updated_at: string
  event_venues: Array<{
    venues: {
      id: string
      name: string
      address?: string | null
      capacity?: number | null
    }
  }>
}

/**
 * Gets all events for the current user's organization
 */
export async function getEvents(search?: string, sportType?: string): Promise<ActionResult<Event[]>> {
  try {
    const supabase = await createUserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return createErrorResult('Not authenticated')
    }

    // Get user's organization membership
    const { data: memberships, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)

    if (membershipError || !memberships || memberships.length === 0) {
      return createSuccessResult([])
    }

    const orgIds = memberships.map(m => m.organization_id)

    // Build the query
    let query = supabase
      .from('events')
      .select(`
        id,
        name,
        sport_type,
        event_date,
        description,
        created_by,
        created_at,
        updated_at,
        event_venues (
          venues (
            id,
            name,
            address,
            capacity
          )
        )
      `)
      .in('organization_id', orgIds)
      .order('event_date', { ascending: true })

    // Apply search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Apply sport type filter if provided
    if (sportType && sportType !== 'all') {
      query = query.eq('sport_type', sportType)
    }

    const { data, error } = await query

    if (error) {
      return createErrorResult(error.message)
    }

    // Transform the data to match the Event interface
    const events: Event[] = (data || []).map((event: EventWithVenues) => ({
      id: event.id,
      name: event.name,
      sport_type: event.sport_type,
      event_date: event.event_date,
      description: event.description,
      created_by: event.created_by,
      created_at: event.created_at,
      updated_at: event.updated_at,
      venues: event.event_venues?.map((ev: any) => ev.venues) || [],
    }))

    return createSuccessResult(events)
  } catch (error) {
    return createErrorResult(handleServerError(error))
  }
}

/**
 * Creates a new event
 */
export async function createEvent(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      name: formData.get('name') as string,
      sportType: formData.get('sportType') as string,
      eventDate: formData.get('eventDate') as string,
      description: formData.get('description') as string || '',
      venueIds: formData.getAll('venueIds') as string[],
    }

    const validated = eventSchema.parse({
      ...rawData,
      eventDate: new Date(rawData.eventDate),
      venueIds: rawData.venueIds,
    })

    const supabase = await createUserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return createErrorResult('Not authenticated')
    }

    // Get user's organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return createErrorResult('No organization found')
    }

    // Create the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        organization_id: membership.organization_id,
        name: validated.name,
        sport_type: validated.sportType,
        event_date: validated.eventDate.toISOString(),
        description: validated.description,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (eventError || !event) {
      return createErrorResult(eventError?.message || 'Failed to create event')
    }

    // Create or link venues
    const adminSupabase = await createClient()

    for (const venueName of validated.venueIds) {
      // Check if venue exists, if not create it
      let { data: existingVenue } = await adminSupabase
        .from('venues')
        .select('id')
        .eq('name', venueName)
        .single()

      let venueId = existingVenue?.id

      if (!venueId) {
        const { data: newVenue, error: venueError } = await adminSupabase
          .from('venues')
          .insert({ name: venueName })
          .select('id')
          .single()

        if (venueError || !newVenue) {
          return createErrorResult(`Failed to create venue: ${venueName}`)
        }

        venueId = newVenue.id
      }

      // Link venue to event
      const { error: linkError } = await adminSupabase
        .from('event_venues')
        .insert({
          event_id: event.id,
          venue_id: venueId,
        })

      if (linkError) {
        return createErrorResult(`Failed to link venue: ${venueName}`)
      }
    }

    revalidatePath('/dashboard')
    return createSuccessResult({ eventId: event.id })
  } catch (error) {
    return createErrorResult(handleServerError(error))
  }
}

/**
 * Updates an existing event
 */
export async function updateEvent(eventId: string, formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      name: formData.get('name') as string,
      sportType: formData.get('sportType') as string,
      eventDate: formData.get('eventDate') as string,
      description: formData.get('description') as string || '',
      venueIds: formData.getAll('venueIds') as string[],
    }

    const validated = eventSchema.parse({
      ...rawData,
      eventDate: new Date(rawData.eventDate),
      venueIds: rawData.venueIds,
    })

    const supabase = await createUserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return createErrorResult('Not authenticated')
    }

    // Update the event
    const { error: updateError } = await supabase
      .from('events')
      .update({
        name: validated.name,
        sport_type: validated.sportType,
        event_date: validated.eventDate.toISOString(),
        description: validated.description,
      })
      .eq('id', eventId)
      .eq('created_by', user.id)

    if (updateError) {
      return createErrorResult(updateError.message)
    }

    // Remove existing venue links
    const adminSupabase = await createClient()
    const { error: deleteError } = await adminSupabase
      .from('event_venues')
      .delete()
      .eq('event_id', eventId)

    if (deleteError) {
      return createErrorResult('Failed to remove old venues')
    }

    // Create or link new venues
    for (const venueName of validated.venueIds) {
      let { data: existingVenue } = await adminSupabase
        .from('venues')
        .select('id')
        .eq('name', venueName)
        .single()

      let venueId = existingVenue?.id

      if (!venueId) {
        const { data: newVenue, error: venueError } = await adminSupabase
          .from('venues')
          .insert({ name: venueName })
          .select('id')
          .single()

        if (venueError || !newVenue) {
          return createErrorResult(`Failed to create venue: ${venueName}`)
        }

        venueId = newVenue.id
      }

      const { error: linkError } = await adminSupabase
        .from('event_venues')
        .insert({
          event_id: eventId,
          venue_id: venueId,
        })

      if (linkError) {
        return createErrorResult(`Failed to link venue: ${venueName}`)
      }
    }

    revalidatePath('/dashboard')
    return createSuccessResult(null)
  } catch (error) {
    return createErrorResult(handleServerError(error))
  }
}

/**
 * Deletes an event
 */
export async function deleteEvent(eventId: string): Promise<ActionResult> {
  try {
    const supabase = await createUserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return createErrorResult('Not authenticated')
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('created_by', user.id)

    if (error) {
      return createErrorResult(error.message)
    }

    revalidatePath('/dashboard')
    return createSuccessResult(null)
  } catch (error) {
    return createErrorResult(handleServerError(error))
  }
}

/**
 * Gets a single event by ID
 */
export async function getEventById(eventId: string): Promise<ActionResult<Event>> {
  try {
    const supabase = await createUserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return createErrorResult('Not authenticated')
    }

    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        name,
        sport_type,
        event_date,
        description,
        created_by,
        created_at,
        updated_at,
        event_venues (
          venues (
            id,
            name,
            address,
            capacity
          )
        )
      `)
      .eq('id', eventId)
      .single()

    if (error || !data) {
      return createErrorResult(error?.message || 'Event not found')
    }

    // Check if user has access to this event's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!membership || data.organization_id !== membership.organization_id) {
      return createErrorResult('Access denied')
    }

    const event: Event = {
      id: data.id,
      name: data.name,
      sport_type: data.sport_type,
      event_date: data.event_date,
      description: data.description,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
      venues: data.event_venues?.map((ev: any) => ev.venues) || [],
    }

    return createSuccessResult(event)
  } catch (error) {
    return createErrorResult(handleServerError(error))
  }
}

