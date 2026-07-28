<script setup lang="ts">
import { usePosts } from '~/composables/usePosts'

const { getPublishedPosts } = usePosts()


const search = ref('')
const selectedCategory = ref('Todas')

const posts = computed(() => {
  return getPublishedPosts()
})

const categories = computed(() => {
  return ['Todas', ...new Set(posts.value.map((post) => post.category))]
})

const selectCategory = (category: string) => {
  selectedCategory.value = category
}

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.value.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.value.toLowerCase())

    const matchesCategory =
      selectedCategory.value === 'Todas' ||
      post.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})
</script>

<template>
  <div>
    <section class="bg-gray-50">
      <UContainer class="py-16">
        <div class="max-w-3xl">
          <p class="text-sm font-semibold uppercase tracking-wide text-primary">
            Mural
          </p>

          <h1 class="mt-3 text-4xl font-bold tracking-tight text-gray-950">
            Mural de Fiolhais
          </h1>

          <p class="mt-4 text-lg text-gray-600">
            Fotografias, vídeos, rescaldos e memórias dos eventos da comunidade.
          </p>
        </div>
      </UContainer>
    </section>

    <section class="py-12">
      <UContainer>
        <div class="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <UInput
            v-model="search"
            placeholder="Pesquisar no mural..."
            size="lg"
          />

          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="category in categories"
              :key="category"
              :variant="selectedCategory === category ? 'solid' : 'outline'"
              @click="selectCategory(category)"
            >
              {{ category }}
            </UButton>
          </div>
        </div>

        <div
          v-if="filteredPosts.length"
          class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
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

        <UCard
          v-else
          class="text-center"
        >
          <p class="font-medium text-gray-950">
            Nenhuma publicação encontrada.
          </p>

          <p class="mt-2 text-sm text-gray-600">
            Tenta pesquisar por outro termo ou categoria.
          </p>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>