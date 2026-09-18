<script setup lang="ts">
import {
  useSupabasePublicPosts,
  type PublicPost
} from '~/composables/useSupabasePublicPosts'

useHead({
  title: 'Mural'
})

const { getPublishedPosts } = useSupabasePublicPosts()

const posts = ref<PublicPost[]>([])
const searchTerm = ref('')
const selectedCategory = ref('all')
const isLoading = ref(true)
const loadError = ref('')

const categories = computed(() => {
  return [
    'all',
    ...new Set(
      posts.value
        .map((post) => post.category)
        .filter(Boolean)
    )
  ]
})

const filteredPosts = computed(() => {
  const search = searchTerm.value
    .trim()
    .toLowerCase()

  return posts.value.filter((post) => {
    const matchesSearch = [
      post.title,
      post.excerpt,
      post.content,
      post.category
    ]
      .join(' ')
      .toLowerCase()
      .includes(search)

    const matchesCategory =
      selectedCategory.value === 'all' ||
      post.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
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

const loadPosts = async () => {
  isLoading.value = true
  loadError.value = ''

  const result = await getPublishedPosts()

  isLoading.value = false

  if (!result.success) {
    loadError.value =
      result.error ||
      'Não foi possível carregar o mural.'

    return
  }

  posts.value = result.posts
}

const handleReload = async () => {
  await loadPosts()
}

onMounted(async () => {
  await loadPosts()
})
</script>

<template>
  <div>
    <section class="bg-[#080808] py-16 text-white">
      <UContainer>
        <p class="text-sm font-bold uppercase tracking-[0.18em] text-amber-400">
          Comunidade
        </p>

        <h1 class="mt-3 text-4xl font-black sm:text-5xl">
          Mural
        </h1>

        <p class="mt-5 max-w-2xl text-lg leading-8 text-gray-300">
          Notícias, novidades e momentos do Centro Cultural e
          Desportivo de Fiolhais.
        </p>
      </UContainer>
    </section>

    <section class="bg-[#f8f4ea] py-12">
      <UContainer>
        <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
          <div class="grid gap-4 lg:grid-cols-[1fr_260px_auto]">
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Pesquisar no mural..."
              class="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >

            <select
              v-model="selectedCategory"
              class="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >
              <option value="all">
                Todas as categorias
              </option>

              <option
                v-for="category in categories.filter((category) => category !== 'all')"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>

            <button
              type="button"
              class="rounded-xl border border-amber-500 px-5 py-3 font-semibold text-amber-700 transition hover:bg-amber-50"
              @click="handleReload"
            >
              Atualizar
            </button>
          </div>
        </div>
      </UContainer>
    </section>

    <section class="bg-white py-16">
      <UContainer>
        <div
          v-if="isLoading"
          class="rounded-3xl border border-amber-200 bg-gray-50 p-10 text-center text-gray-600"
        >
          A carregar publicações...
        </div>

        <div
          v-else-if="loadError"
          class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"
        >
          <p class="font-bold">
            Não foi possível carregar o mural.
          </p>

          <p class="mt-2">
            {{ loadError }}
          </p>
        </div>

        <div
          v-else-if="filteredPosts.length"
          class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          <article
            v-for="post in filteredPosts"
            :key="post.id"
            class="flex flex-col rounded-3xl border border-amber-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-4xl">
                {{ post.coverEmoji }}
              </div>

              <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                {{ post.category }}
              </span>
            </div>

            <h2 class="mt-5 text-2xl font-bold text-gray-950">
              {{ post.title }}
            </h2>

            <p class="mt-3 flex-1 leading-7 text-gray-600">
              {{ post.excerpt }}
            </p>

            <p
              v-if="post.publishedAt"
              class="mt-5 text-sm text-gray-500"
            >
              {{ formatDate(post.publishedAt) }}
            </p>

            <NuxtLink
              :to="`/mural/${post.slug}`"
              class="mt-5 font-bold text-amber-700 transition hover:text-amber-600"
            >
              Ler publicação →
            </NuxtLink>
          </article>
        </div>

        <SharedEmptyState
          v-else
          icon="🖼️"
          title="Nenhuma publicação encontrada"
          description="Ainda não existem publicações ou os filtros selecionados não têm resultados."
        />
      </UContainer>
    </section>
  </div>
</template>