export type PostStatus = 'draft' | 'published'

export type PostMediaType = 'image' | 'video'

export interface PostMedia {
  id: string | number
  type: PostMediaType
  url: string
  caption?: string
}

export interface PostItem {
  id: string | number
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  coverEmoji: string
  status: PostStatus
  createdAt: string
  publishedAt?: string
  media: PostMedia[]
}

export interface CreatePostInput {
  title: string
  excerpt: string
  content: string
  category: string
  coverEmoji: string
  status: PostStatus
}

export interface UpdatePostInput {
  title: string
  excerpt: string
  content: string
  category: string
  coverEmoji: string
  status: PostStatus
}