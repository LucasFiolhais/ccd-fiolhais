<script setup lang="ts">
import { usePosts } from '~/composables/usePosts'

const { getPublishedPosts } = usePosts()

const searchTerm = ref('')
const selectedCategory = ref('Todos')

const posts = computed(() => {
  return getPublishedPosts()
})

const categoryOptions = computed(() => {
  const categories = posts.value.map((post) => post.category)
  return ['Todos', ...new Set(categories)]
})

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    const matchesSearch = [
      post.title,
      post.excerpt,
      post.content,
      post.category
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.value.toLowerCase())

    const matchesCategory =
      selectedCategory.value === 'Todos' ||
      post.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

const selectCategory = (category: string) => {
  selectedCategory.value = category
}
</script>

<template>
  <div>
    <section class="bg-gray-50 py-16">
      <UContainer>
        <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
          Mural
        </p>

        <h1 class="mt-3 text-4xl font-bold text-gray-950">
          Memórias da comunidade
        </h1>

        <p class="mt-4 max-w-3xl text-lg leading-8 text-gray-700">
          Fotografias, vídeos, rescaldos e publicações dos eventos e iniciativas do CCD de Fiolhais.
        </p>
      </UContainer>
    </section>

    <section class="py-12">
      <UContainer>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Pesquisar publicação..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 lg:max-w-3xl"
          >

          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in categoryOptions"
              :key="category"
              type="button"
              class="rounded-xl border px-4 py-2 text-sm font-semibold transition"
              :class="selectedCategory === category
                ? 'border-amber-500 bg-amber-500 text-black'
                : 'border-amber-300 bg-white text-amber-700 hover:bg-amber-50'"
              @click="selectCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div
          v-if="filteredPosts.length"
          class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          <PublicMuralCard
            v-for="post in filteredPosts"
            :key="post.id"
            :title="post.title"
            :category="post.category"
            :description="post.excerpt"
            :emoji="post.coverEmoji"
            :to="`/mural/${post.slug}`"
          />
        </div>

        <SharedEmptyState
          v-else
          class="mt-8"
          icon="🖼️"
          title="Nenhuma publicação encontrada"
          description="Tenta pesquisar por outro termo ou categoria. As publicações visíveis são apenas as que estão publicadas."
          action-label="Voltar ao mural"
          action-to="/mural"
        />
      </UContainer>
    </section>
  </div>
</template>