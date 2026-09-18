export type PublicEventStatus =
  | 'draft'
  | 'open'
  | 'soon'
  | 'sold_out'
  | 'closed'

export interface PublicEvent {
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
  status: PublicEventStatus
  category: string
  imageEmoji: string
}

interface SupabasePublicEventRow {
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
  status: PublicEventStatus
  category: string
  image_emoji: string
}

const mapPublicEvent = (
  event: SupabasePublicEventRow
): PublicEvent => {
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
    imageEmoji: event.image_emoji
  }
}

export const useSupabasePublicEvents = () => {
  const getPublishedEvents = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Não foi possível ligar ao serviço de dados.',
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
        image_emoji
      `)
      .eq('is_published', true)
      .order('event_date', {
        ascending: true,
        nullsFirst: false
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
        return mapPublicEvent(
          event as SupabasePublicEventRow
        )
      })
    }
  }

  const getPublishedEventBySlug = async (
    eventSlug: string
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Não foi possível ligar ao serviço de dados.',
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
        image_emoji
      `)
      .eq('slug', eventSlug)
      .eq('is_published', true)
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
      event: mapPublicEvent(
        data as SupabasePublicEventRow
      )
    }
  }

  return {
    getPublishedEvents,
    getPublishedEventBySlug
  }
}