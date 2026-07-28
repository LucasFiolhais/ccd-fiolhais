import type { CreatePostInput, PostItem } from '~/types/post'

const initialPosts: PostItem[] = [
  {
    id: 1,
    title: 'Memórias dos convívios',
    slug: 'memorias-dos-convivios',
    excerpt: 'Um espaço para recordar os momentos de encontro, partilha e comunidade em Fiolhais.',
    content:
      'O Mural de Fiolhais nasce com o objetivo de guardar as memórias dos eventos, convívios e iniciativas organizadas pelo Centro Cultural e Desportivo de Fiolhais. Aqui poderão ser partilhadas fotografias, vídeos, rescaldos e pequenos textos que ajudam a preservar a história da nossa comunidade.',
    category: 'Fotografias',
    coverEmoji: '📸',
    status: 'published',
    createdAt: '2026-07-20',
    publishedAt: '2026-07-20',
    media: []
  },
  {
    id: 2,
    title: 'Rescaldo do Almoço Comunitário',
    slug: 'rescaldo-do-almoco-comunitario',
    excerpt: 'Resumo de um almoço pensado para juntar sócios, famílias e amigos da comunidade.',
    content:
      'O Almoço Comunitário foi pensado como um momento de encontro entre sócios, familiares e amigos do CCD. Estes eventos são fundamentais para fortalecer laços, aproximar gerações e manter viva a participação da população nas atividades da associação.',
    category: 'Comunidade',
    coverEmoji: '🍽️',
    status: 'published',
    createdAt: '2026-07-21',
    publishedAt: '2026-07-21',
    media: []
  },
  {
    id: 3,
    title: 'Tradições de Fiolhais',
    slug: 'tradicoes-de-fiolhais',
    excerpt: 'Um espaço dedicado à cultura, às tradições e à identidade local.',
    content:
      'As tradições de Fiolhais fazem parte da identidade da terra. Desde os convívios aos magustos, passando pelas festas populares e iniciativas culturais, o CCD tem um papel importante na preservação destes momentos e na criação de novas memórias.',
    category: 'Cultura',
    coverEmoji: '🏡',
    status: 'draft',
    createdAt: '2026-07-22',
    media: []
  }
]

export const usePosts = () => {
  const posts = useState<PostItem[]>('posts', () => initialPosts)

  const getPosts = () => {
    return posts.value
  }

  const getPublishedPosts = () => {
    return posts.value.filter((post) => post.status === 'published')
  }

  const getPostBySlug = (slug: string) => {
    return posts.value.find((post) => post.slug === slug)
  }

  const slugify = (value: string) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const generateUniqueSlug = (title: string) => {
    const baseSlug = slugify(title)
    let slug = baseSlug
    let counter = 2

    while (posts.value.some((post) => post.slug === slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  const createPost = (input: CreatePostInput) => {
    const nextId =
      posts.value.length > 0
        ? Math.max(...posts.value.map((post) => post.id)) + 1
        : 1

    const today = new Date().toISOString().slice(0, 10)

    const newPost: PostItem = {
      id: nextId,
      title: input.title,
      slug: generateUniqueSlug(input.title),
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      coverEmoji: input.coverEmoji,
      status: input.status,
      createdAt: today,
      publishedAt: input.status === 'published' ? today : undefined,
      media: []
    }

    posts.value.push(newPost)

    return newPost
  }

  const publishPost = (postId: number) => {
    const post = posts.value.find((item) => item.id === postId)

    if (!post) {
      return
    }

    post.status = 'published'
    post.publishedAt = new Date().toISOString().slice(0, 10)
  }

  const unpublishPost = (postId: number) => {
    const post = posts.value.find((item) => item.id === postId)

    if (!post) {
      return
    }

    post.status = 'draft'
    post.publishedAt = undefined
  }

  return {
    posts,
    getPosts,
    getPublishedPosts,
    getPostBySlug,
    createPost,
    publishPost,
    unpublishPost
  }
}