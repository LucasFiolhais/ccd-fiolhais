export type AdminEventStatus = 'draft' | 'open' | 'soon' | 'sold_out' | 'closed'
export type AdminEventRegistrationStatus = 'pending' | 'confirmed' | 'cancelled'
export type AdminEventPaymentStatus = 'pending' | 'paid' | 'cancelled'

export interface AdminEvent {
  id: string
  slug: string
  title: string
  description: string
  longDescription: string
  dateLabel: string
  eventDate?: string
  timeLabel?: string
  eventTime?: string
  location: string
  priceMember: string
  priceNonMember: string
  capacity: number
  status: AdminEventStatus
  category: string
  imageEmoji: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  registeredSeats: number
  pendingPayments: number
  registrationsCount: number
}

export interface CreateAdminEventInput {
  title: string
  description: string
  longDescription: string
  dateLabel: string
  eventDate?: string
  timeLabel?: string
  eventTime?: string
  location: string
  priceMember: string
  priceNonMember: string
  capacity: number
  status: AdminEventStatus
  category: string
  imageEmoji: string
  isPublished: boolean
}

export interface UpdateAdminEventInput extends CreateAdminEventInput {}

interface SupabaseEventRegistrationRow {
  id: string
  seats: number
  status: AdminEventRegistrationStatus
  payment_status: AdminEventPaymentStatus
}

type SupabaseRelation<T> = T | T[] | null

interface SupabaseEventRow {
  id: string
  slug: string
  title: string
  description: string
  long_description: string
  date_label: string
  event_date: string | null
  time_label: string | null
  event_time: string | null
  location: string
  price_member: string
  price_non_member: string
  capacity: number
  status: AdminEventStatus
  category: string
  image_emoji: string
  is_published: boolean
  created_at: string
  updated_at: string
  event_registrations: SupabaseRelation<SupabaseEventRegistrationRow>
}

interface SupabaseEventSlugRow {
  slug: string
}

const getArrayRelation = <T>(relation: SupabaseRelation<T>) => {
  if (!relation) {
    return []
  }

  if (Array.isArray(relation)) {
    return relation
  }

  return [relation]
}

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const mapEvent = (event: SupabaseEventRow): AdminEvent => {
  const registrations = getArrayRelation(event.event_registrations)

  const activeRegistrations = registrations.filter((registration) => {
    return registration.status !== 'cancelled' &&
      registration.payment_status !== 'cancelled'
  })

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    longDescription: event.long_description,
    dateLabel: event.date_label,
    eventDate: event.event_date || undefined,
    timeLabel: event.time_label || undefined,
    eventTime: event.event_time || undefined,
    location: event.location,
    priceMember: event.price_member,
    priceNonMember: event.price_non_member,
    capacity: event.capacity,
    status: event.status,
    category: event.category,
    imageEmoji: event.image_emoji,
    isPublished: event.is_published,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
    registeredSeats: activeRegistrations.reduce((total, registration) => {
      return total + registration.seats
    }, 0),
    pendingPayments: activeRegistrations.filter((registration) => {
      return registration.payment_status === 'pending'
    }).length,
    registrationsCount: activeRegistrations.length
  }
}

export const useSupabaseAdminEvents = () => {
  const getEvents = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        events: []
      }
    }

    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        slug,
        title,
        description,
        long_description,
        date_label,
        event_date,
        time_label,
        event_time,
        location,
        price_member,
        price_non_member,
        capacity,
        status,
        category,
        image_emoji,
        is_published,
        created_at,
        updated_at,
        event_registrations (
          id,
          seats,
          status,
          payment_status
        )
      `)
      .order('created_at', {
        ascending: false
      })

    if (error) {
      return {
        success: false,
        error: error.message,
        events: []
      }
    }

    return {
      success: true,
      error: null,
      events: (data || []).map((event) => {
        return mapEvent(event as unknown as SupabaseEventRow)
      })
    }
  }

  const getEventBySlug = async (eventSlug: string) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        event: null
      }
    }

    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        slug,
        title,
        description,
        long_description,
        date_label,
        event_date,
        time_label,
        event_time,
        location,
        price_member,
        price_non_member,
        capacity,
        status,
        category,
        image_emoji,
        is_published,
        created_at,
        updated_at,
        event_registrations (
          id,
          seats,
          status,
          payment_status
        )
      `)
      .eq('slug', eventSlug)
      .maybeSingle()

    if (error) {
      return {
        success: false,
        error: error.message,
        event: null
      }
    }

    if (!data) {
      return {
        success: true,
        error: null,
        event: null
      }
    }

    return {
      success: true,
      error: null,
      event: mapEvent(data as unknown as SupabaseEventRow)
    }
  }

  const generateUniqueSlug = async (title: string) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return slugify(title)
    }

    const baseSlug = slugify(title) || 'evento'
    let slug = baseSlug
    let counter = 2

    const { data } = await supabase
      .from('events')
      .select('slug')

    const existingSlugs = ((data || []) as SupabaseEventSlugRow[]).map((event) => {
      return event.slug
    })

    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  const createEvent = async (input: CreateAdminEventInput) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        slug: null
      }
    }

    const slug = await generateUniqueSlug(input.title)

    const { data, error } = await supabase
      .from('events')
      .insert({
        slug,
        title: input.title,
        description: input.description,
        long_description: input.longDescription,
        date_label: input.dateLabel,
        event_date: input.eventDate || null,
        time_label: input.timeLabel || null,
        event_time: input.eventTime || null,
        location: input.location,
        price_member: input.priceMember,
        price_non_member: input.priceNonMember,
        capacity: input.capacity,
        status: input.status,
        category: input.category,
        image_emoji: input.imageEmoji,
        is_published: input.isPublished
      })
      .select('slug')
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        slug: null
      }
    }

    return {
      success: true,
      error: null,
      slug: data.slug as string
    }
  }

  const updateEvent = async (
    eventId: string,
    input: UpdateAdminEventInput
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('events')
      .update({
        title: input.title,
        description: input.description,
        long_description: input.longDescription,
        date_label: input.dateLabel,
        event_date: input.eventDate || null,
        time_label: input.timeLabel || null,
        event_time: input.eventTime || null,
        location: input.location,
        price_member: input.priceMember,
        price_non_member: input.priceNonMember,
        capacity: input.capacity,
        status: input.status,
        category: input.category,
        image_emoji: input.imageEmoji,
        is_published: input.isPublished
      })
      .eq('id', eventId)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      error: null
    }
  }

  const updateEventStatus = async (
    eventId: string,
    status: AdminEventStatus
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('events')
      .update({
        status
      })
      .eq('id', eventId)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      error: null
    }
  }

  const updateEventPublication = async (
    eventId: string,
    isPublished: boolean
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('events')
      .update({
        is_published: isPublished
      })
      .eq('id', eventId)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      error: null
    }
  }

  const deleteEvent = async (eventId: string) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      error: null
    }
  }

  return {
    getEvents,
    getEventBySlug,
    createEvent,
    updateEvent,
    updateEventStatus,
    updateEventPublication,
    deleteEvent
  }
}