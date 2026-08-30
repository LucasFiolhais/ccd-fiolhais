import type { PostItem, PostStatus } from '~/types/post'

interface SupabasePostRow {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  cover_emoji: string
  status: PostStatus
  published_at: string | null
  created_at: string
}

const mapSupabasePostToPostItem = (post: SupabasePostRow): PostItem => {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    coverEmoji: post.cover_emoji,
    status: post.status,
    createdAt: post.created_at.slice(0, 10),
    publishedAt: post.published_at || undefined,
    media: []
  }
}

export const useSupabasePosts = () => {
  const supabase = useSupabaseClient()

  const getPublishedPosts = async () => {
    if (!supabase) {
      return []
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
        status,
        published_at,
        created_at
      `)
      .eq('status', 'published')
      .order('published_at', {
        ascending: false,
        nullsFirst: false
      })

    if (error) {
      console.error('Erro ao buscar publicações do Supabase:', error.message)
      return []
    }

    return (data || []).map((post) => {
      return mapSupabasePostToPostItem(post as SupabasePostRow)
    })
  }

  const getPublishedPostBySlug = async (slug: string) => {
    if (!supabase) {
      return null
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
        status,
        published_at,
        created_at
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar publicação do Supabase:', error.message)
      return null
    }

    if (!data) {
      return null
    }

    return mapSupabasePostToPostItem(data as SupabasePostRow)
  }

  return {
    getPublishedPosts,
    getPublishedPostBySlug
  }
}