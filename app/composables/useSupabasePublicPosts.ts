export interface PublicPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  coverEmoji: string
  publishedAt?: string
}

interface SupabasePublicPostRow {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  cover_emoji: string
  published_at: string | null
}

const mapPublicPost = (
  post: SupabasePublicPostRow
): PublicPost => {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    coverEmoji: post.cover_emoji,
    publishedAt: post.published_at || undefined
  }
}

export const useSupabasePublicPosts = () => {
  const getPublishedPosts = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Não foi possível ligar ao serviço de dados.',
        posts: []
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        slug,
        title,
        excerpt,
        content,
        category,
        cover_emoji,
        published_at
      `)
      .eq('status', 'published')
      .order('published_at', {
        ascending: false,
        nullsFirst: false
      })

    if (error) {
      return {
        success: false,
        error: error.message,
        posts: []
      }
    }

    return {
      success: true,
      error: null,
      posts: (data || []).map((post) => {
        return mapPublicPost(
          post as SupabasePublicPostRow
        )
      })
    }
  }

  const getPublishedPostBySlug = async (
    postSlug: string
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Não foi possível ligar ao serviço de dados.',
        post: null
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        slug,
        title,
        excerpt,
        content,
        category,
        cover_emoji,
        published_at
      `)
      .eq('slug', postSlug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) {
      return {
        success: false,
        error: error.message,
        post: null
      }
    }

    if (!data) {
      return {
        success: true,
        error: null,
        post: null
      }
    }

    return {
      success: true,
      error: null,
      post: mapPublicPost(
        data as SupabasePublicPostRow
      )
    }
  }

  return {
    getPublishedPosts,
    getPublishedPostBySlug
  }
}