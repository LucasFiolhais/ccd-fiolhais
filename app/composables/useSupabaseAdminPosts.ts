export type AdminPostStatus = 'draft' | 'published'

export interface AdminPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  coverEmoji: string
  status: AdminPostStatus
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAdminPostInput {
  title: string
  excerpt: string
  content: string
  category: string
  coverEmoji: string
  status: AdminPostStatus
}

export interface UpdateAdminPostInput {
  title: string
  excerpt: string
  content: string
  category: string
  coverEmoji: string
  status: AdminPostStatus
}

interface SupabasePostRow {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  cover_emoji: string
  status: AdminPostStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

interface SupabasePostSlugRow {
  slug: string
}

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10)
}

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const mapPost = (post: SupabasePostRow): AdminPost => {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    coverEmoji: post.cover_emoji,
    status: post.status,
    publishedAt: post.published_at || undefined,
    createdAt: post.created_at,
    updatedAt: post.updated_at
  }
}

export const useSupabaseAdminPosts = () => {
  const getPosts = async () => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
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
        status,
        published_at,
        created_at,
        updated_at
      `)
      .order('created_at', {
        ascending: false
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
        return mapPost(post as SupabasePostRow)
      })
    }
  }

  const getPostBySlug = async (postSlug: string) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.',
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
        status,
        published_at,
        created_at,
        updated_at
      `)
      .eq('slug', postSlug)
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
      post: mapPost(data as SupabasePostRow)
    }
  }

  const generateUniqueSlug = async (title: string) => {
    const supabase = useSupabaseClient()

    const baseSlug = slugify(title) || 'publicacao'

    if (!supabase) {
      return baseSlug
    }

    const { data, error } = await supabase
      .from('posts')
      .select('slug')

    if (error) {
      return baseSlug
    }

    const existingSlugs = ((data || []) as SupabasePostSlugRow[])
      .map((post) => post.slug)

    let slug = baseSlug
    let counter = 2

    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  const createPost = async (input: CreateAdminPostInput) => {
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
      .from('posts')
      .insert({
        slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        category: input.category,
        cover_emoji: input.coverEmoji,
        status: input.status,
        published_at:
          input.status === 'published'
            ? getTodayDate()
            : null
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

  const updatePost = async (
    postId: string,
    input: UpdateAdminPostInput,
    currentPublishedAt?: string
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const publishedAt =
      input.status === 'published'
        ? currentPublishedAt || getTodayDate()
        : null

    const { error } = await supabase
      .from('posts')
      .update({
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        category: input.category,
        cover_emoji: input.coverEmoji,
        status: input.status,
        published_at: publishedAt
      })
      .eq('id', postId)

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

  const updatePostStatus = async (
    postId: string,
    status: AdminPostStatus
  ) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('posts')
      .update({
        status,
        published_at:
          status === 'published'
            ? getTodayDate()
            : null
      })
      .eq('id', postId)

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

  const deletePost = async (postId: string) => {
    const supabase = useSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase ainda não está configurado.'
      }
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

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
    getPosts,
    getPostBySlug,
    createPost,
    updatePost,
    updatePostStatus,
    deletePost
  }
}