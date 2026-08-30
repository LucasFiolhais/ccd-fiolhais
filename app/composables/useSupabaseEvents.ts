import type { EventItem, EventStatus } from '~/types/event'

interface SupabaseEventRow {
  id: string
  slug: string
  title: string
  description: string
  long_description: string
  date_label: string
  time_label: string | null
  location: string
  price_member: string
  price_non_member: string
  capacity: number
  status: EventStatus
  category: string
  image_emoji: string
  created_at: string
}

const mapSupabaseEventToEventItem = (event: SupabaseEventRow): EventItem => {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    longDescription: event.long_description,
    date: event.date_label,
    time: event.time_label || 'Hora a anunciar',
    location: event.location,
    priceMember: event.price_member,
    priceNonMember: event.price_non_member,
    capacity: event.capacity,
    registered: 0,
    status: event.status,
    category: event.category,
    imageEmoji: event.image_emoji
  }
}

export const useSupabaseEvents = () => {
  const supabase = useSupabaseClient()

  const getPublishedEvents = async () => {
    if (!supabase) {
      return []
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
        time_label,
        location,
        price_member,
        price_non_member,
        capacity,
        status,
        category,
        image_emoji,
        created_at
      `)
      .eq('is_published', true)
      .order('created_at', {
        ascending: false
      })

    if (error) {
      console.error('Erro ao buscar eventos do Supabase:', error.message)
      return []
    }

    return (data || []).map((event) => {
      return mapSupabaseEventToEventItem(event as SupabaseEventRow)
    })
  }

  const getPublishedEventBySlug = async (slug: string) => {
    if (!supabase) {
      return null
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
        time_label,
        location,
        price_member,
        price_non_member,
        capacity,
        status,
        category,
        image_emoji,
        created_at
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar evento do Supabase:', error.message)
      return null
    }

    if (!data) {
      return null
    }

    return mapSupabaseEventToEventItem(data as SupabaseEventRow)
  }

  return {
    getPublishedEvents,
    getPublishedEventBySlug
  }
}