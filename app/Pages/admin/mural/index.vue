<script setup lang="ts">
import { usePosts } from '~/composables/usePosts'
import type { PostStatus } from '~/types/post'

definePageMeta({
  layout: 'admin'
})

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const {
  getPosts,
  publishPost,
  unpublishPost
} = usePosts()

const search = ref('')
const selectedStatus = ref('Todos')

const posts = getPosts()

const statusOptions = ['Todos', 'Publicado', 'Rascunho']

const getStatusLabel = (status: PostStatus) => {
  if (status === 'published') return 'Publicado'

  return 'Rascunho'
}

const getStatusColor = (status: PostStatus): BadgeColor => {
  if (status === 'published') return 'success'

  return 'warning'
}

const filteredPosts = computed(() => {
  return posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.value.toLowerCase()) ||
      post.category.toLowerCase().includes(search.value.toLowerCase())

    const matchesStatus =
      selectedStatus.value === 'Todos' ||
      getStatusLabel(post.status) === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

const totalPosts = computed(() => posts.length)

const publishedPosts = computed(() => {
  return posts.filter((post) => post.status === 'published').length
})

const draftPosts = computed(() => {
  return posts.filter((post) => post.status === 'draft').length
})

const handleToggleStatus = (postId: number, status: PostStatus) => {
  if (status === 'published') {
    unpublishPost(postId)
    return
  }

  publishPost(postId)
}
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">
          Mural
        </p>

        <h1 class="mt-2 text-3xl font-bold text-gray-950">
          Gestão do mural
        </h1>

        <p class="mt-2 text-gray-600">
          Publicações, fotografias, vídeos e rescaldos de eventos.
        </p>
      </div>

      <UButton to="/admin/mural/novo">
        Nova publicação
      </UButton>
    </div>

    <div class="mb-8 grid gap-6 md:grid-cols-3">
      <AdminStatCard
        label="Total de publicações"
        :value="totalPosts"
        description="Inclui rascunhos e publicados"
      />

      <AdminStatCard
        label="Publicadas"
        :value="publishedPosts"
        description="Visíveis no site público"
      />

      <AdminStatCard
        label="Rascunhos"
        :value="draftPosts"
        description="Ainda não visíveis"
      />
    </div>

    <UCard>
      <div class="mb-6 grid gap-4 md:grid-cols-[1fr_220px]">
        <UInput
          v-model="search"
          placeholder="Pesquisar por título ou categoria..."
          size="lg"
        />

        <USelect
          v-model="selectedStatus"
          :items="statusOptions"
          size="lg"
        />
      </div>

      <div class="grid gap-5">
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="rounded-2xl border border-gray-200 p-5"
        >
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex gap-4">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
                {{ post.coverEmoji }}
              </div>

              <div>
                <div class="flex flex-wrap items-center gap-3">
                  <h2 class="text-lg font-bold text-gray-950">
                    {{ post.title }}
                  </h2>

                  <UBadge
                    :color="getStatusColor(post.status)"
                    variant="soft"
                  >
                    {{ getStatusLabel(post.status) }}
                  </UBadge>
                </div>

                <p class="mt-1 text-sm text-gray-600">
                  {{ post.category }} · criado em {{ post.createdAt }}
                </p>

                <p class="mt-1 text-sm text-gray-500">
                  {{ post.excerpt }}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="post.status === 'published'"
                :to="`/mural/${post.slug}`"
                variant="outline"
              >
                Ver página
              </UButton>

              <UButton
                variant="soft"
                @click="handleToggleStatus(post.id, post.status)"
              >
                {{ post.status === 'published' ? 'Despublicar' : 'Publicar' }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!filteredPosts.length"
        class="py-10 text-center"
      >
        <p class="font-medium text-gray-950">
          Nenhuma publicação encontrada.
        </p>

        <p class="mt-1 text-sm text-gray-500">
          Tenta alterar a pesquisa ou o filtro.
        </p>
      </div>
    </UCard>
  </UContainer>
</template>