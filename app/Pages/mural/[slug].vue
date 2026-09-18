<script setup lang="ts">
import {
  useSupabasePublicPosts,
  type PublicPost
} from '~/composables/useSupabasePublicPosts'

const route = useRoute()

const {
  getPublishedPostBySlug
} = useSupabasePublicPosts()

const post = ref<PublicPost | null>(null)
const isLoading = ref(true)
const loadError = ref('')

const postSlug = computed(() => {
  return String(route.params.slug)
})

useHead(() => {
  return {
    title: post.value?.title || 'Publicação'
  }
})

const formatDate = (value?: string) => {
  if (!value) {
    return ''
  }

  const date = value.includes('T')
    ? new Date(value)
    : new Date(`${value}T00:00:00`)

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const loadPost = async () => {
  isLoading.value = true
  loadError.value = ''

  const result = await getPublishedPostBySlug(
    postSlug.value
  )

  isLoading.value = false

  if (!result.success) {
    loadError.value =
      result.error ||
      'Não foi possível carregar a publicação.'

    post.value = null
    return
  }

  post.value = result.post
}

onMounted(async () => {
  await loadPost()
})
</script>

<template>
  <section class="bg-[#f8f4ea] py-16">
    <UContainer>
      <NuxtLink
        to="/mural"
        class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
      >
        ← Voltar ao mural
      </NuxtLink>

      <div
        v-if="isLoading"
        class="mt-8 rounded-3xl border border-amber-200 bg-white p-10 text-center text-gray-600 shadow-sm"
      >
        A carregar publicação...
      </div>

      <div
        v-else-if="loadError"
        class="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"
      >
        <p class="font-bold">
          Erro
        </p>

        <p class="mt-2">
          {{ loadError }}
        </p>
      </div>

      <article
        v-else-if="post"
        class="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm"
      >
        <div class="flex min-h-52 items-center justify-center bg-gray-50 text-8xl">
          {{ post.coverEmoji }}
        </div>

        <div class="p-7 sm:p-10">
          <div class="flex flex-wrap items-center gap-3">
            <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              {{ post.category }}
            </span>

            <span
              v-if="post.publishedAt"
              class="text-sm text-gray-500"
            >
              {{ formatDate(post.publishedAt) }}
            </span>
          </div>

          <h1 class="mt-5 text-3xl font-black text-gray-950 sm:text-4xl">
            {{ post.title }}
          </h1>

          <p class="mt-5 text-lg leading-8 text-gray-600">
            {{ post.excerpt }}
          </p>

          <div class="my-8 border-t border-gray-200" />

          <p class="whitespace-pre-line leading-8 text-gray-700">
            {{ post.content }}
          </p>
        </div>
      </article>

      <SharedEmptyState
        v-else
        class="mt-8"
        icon="🖼️"
        title="Publicação não encontrada"
        description="Esta publicação não existe ou deixou de estar publicada."
        action-label="Voltar ao mural"
        action-to="/mural"
      />
    </UContainer>
  </section>
</template>