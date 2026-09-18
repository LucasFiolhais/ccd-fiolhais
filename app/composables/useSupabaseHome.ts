export type HomeEventStatus =
  | 'draft'
  | 'open'
  | 'soon'
  | 'sold_out'
  | 'closed'

export interface HomeEvent {
  id: string
  slug: string
  title: string
  description: string
  dateLabel: string
  eventDate?: string
  timeLabel?: string
  eventTime?: string
  location: string
  priceMember: string
  priceNonMember: string
  status: HomeEventStatus
  category: string
  imageEmoji: string
}

export interface HomePost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  coverEmoji: string
  publishedAt?: string
}

export interface HomeData {
  events: HomeEvent[]
  posts: HomePost[]
}

interface SupabaseHomeEventRow {
  id: string
  slug: string
  title: string
  description: string
  date_label: string
  event_date: string | null
  time_label: string | null
  event_time: string | null
  location: string
  price_member: string
  price_non_member: string
  status: HomeEventStatus
  category: string
  image_emoji: string
}

interface SupabaseHomePostRow {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  cover_emoji: string
  published_at: string | null
}

const mapEvent = (
  event: SupabaseHomeEventRow
): HomeEvent => {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    dateLabel: event.date_label,
    eventDate: event.event_date || undefined,
    timeLabel: event.time_label || undefined,
    eventTime: event.event_time || undefined,
    location: event.location,
    priceMember: event.price_member,
    priceNonMember: event.price_non_member,
    status: event.status,
    category: event.category,
    imageEmoji: event.image_emoji
  }
}

const mapPost = (
  post: SupabaseHomePostRow
): HomePost => {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    coverEmoji: post.cover_emoji,
    publishedAt: post.published_at || undefined
  }
}

export const useSupabaseHome = () => {
  const getHomeData = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
        data: {
          events: [],
          posts: []
        } satisfies HomeData
      }
    }

    const [
      eventsResult,
      postsResult
    ] = await Promise.all([
      supabase
        .from('events')
        .select(`
          id,
          slug,
          title,
          description,
          date_label,
          event_date,
          time_label,
          event_time,
          location,
          price_member,
          price_non_member,
          status,
          category,
          image_emoji
        `)
        .eq('is_published', true)
        .in('status', [
          'open',
          'soon',
          'sold_out'
        ])
        .order('event_date', {
          ascending: true,
          nullsFirst: false
        })
        .limit(3),

      supabase
        .from('posts')
        .select(`
          id,
          slug,
          title,
          excerpt,
          category,
          cover_emoji,
          published_at
        `)
        .eq('status', 'published')
        .order('published_at', {
          ascending: false,
          nullsFirst: false
        })
        .limit(3)
    ])

    if (eventsResult.error) {
      return {
        success: false,
        error: eventsResult.error.message,
        data: {
          events: [],
          posts: []
        } satisfies HomeData
      }
    }

    if (postsResult.error) {
      return {
        success: false,
        error: postsResult.error.message,
        data: {
          events: [],
          posts: []
        } satisfies HomeData
      }
    }

    const data: HomeData = {
      events: (
        (eventsResult.data || []) as SupabaseHomeEventRow[]
      ).map((event) => {
        return mapEvent(event)
      }),

      posts: (
        (postsResult.data || []) as SupabaseHomePostRow[]
      ).map((post) => {
        return mapPost(post)
      })
    }

    return {
      success: true,
      error: null,
      data
    }
  }

  return {
    getHomeData
  }
}