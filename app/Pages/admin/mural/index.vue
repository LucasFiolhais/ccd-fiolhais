<script setup lang="ts">
import {
  useSupabaseAdminPosts,
  type AdminPost,
  type AdminPostStatus
} from '~/composables/useSupabaseAdminPosts'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Mural'
})

type StatusFilter = 'all' | AdminPostStatus

const {
  getPosts,
  updatePostStatus,
  deletePost
} = useSupabaseAdminPosts()

const posts = ref<AdminPost[]>([])
const searchTerm = ref('')
const selectedStatus = ref<StatusFilter>('all')

const isLoading = ref(true)
const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

const statusOptions: Array<{
  label: string
  value: StatusFilter
}> = [
  {
    label: 'Todas',
    value: 'all'
  },
  {
    label: 'Publicadas',
    value: 'published'
  },
  {
    label: 'Rascunhos',
    value: 'draft'
  }
]

const getStatusLabel = (status: AdminPostStatus) => {
  return status === 'published'
    ? 'Publicada'
    : 'Rascunho'
}

const getStatusClass = (status: AdminPostStatus) => {
  if (status === 'published') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  return 'border-gray-200 bg-gray-50 text-gray-600'
}

const formatDate = (value?: string) => {
  if (!value) {
    return 'Não publicada'
  }

  const date = value.includes('T')
    ? new Date(value)
    : new Date(`${value}T00:00:00`)

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short'
  }).format(date)
}

const totalPosts = computed(() => {
  return posts.value.length
})

const publishedPosts = computed(() => {
  return posts.value.filter((post) => {
    return post.status === 'published'
  }).length
})

const draftPosts = computed(() => {
  return posts.value.filter((post) => {
    return post.status === 'draft'
  }).length
})

const categoriesCount = computed(() => {
  return new Set(
    posts.value.map((post) => post.category)
  ).size
})

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    const searchValue = searchTerm.value.toLowerCase()

    const matchesSearch = [
      post.title,
      post.excerpt,
      post.content,
      post.category
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchValue)

    const matchesStatus =
      selectedStatus.value === 'all' ||
      post.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

const loadPosts = async () => {
  isLoading.value = true
  submitError.value = ''
  successMessage.value = ''

  const result = await getPosts()

  isLoading.value = false

  if (!result.success) {
    submitError.value =
      result.error || 'Não foi possível carregar as publicações.'

    return
  }

  posts.value = result.posts
}

const handleReload = async () => {
  await loadPosts()
}

const handleTogglePublication = async (post: AdminPost) => {
  submitError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  const newStatus: AdminPostStatus =
    post.status === 'published'
      ? 'draft'
      : 'published'

  const result = await updatePostStatus(
    post.id,
    newStatus
  )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value =
      result.error ||
      'Não foi possível atualizar o estado da publicação.'

    return
  }

  successMessage.value =
    newStatus === 'published'
      ? 'Publicação publicada com sucesso.'
      : 'Publicação convertida em rascunho.'

  await loadPosts()
}

const handleDeletePost = async (post: AdminPost) => {
  const confirmed = confirm(
    `Tens a certeza que queres apagar a publicação "${post.title}"?`
  )

  if (!confirmed) {
    return
  }

  submitError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  const result = await deletePost(post.id)

  isSubmitting.value = false

  if (!result.success) {
    submitError.value =
      result.error || 'Não foi possível apagar a publicação.'

    return
  }

  successMessage.value =
    'Publicação apagada com sucesso.'

  await loadPosts()
}

onMounted(async () => {
  await loadPosts()
})
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
          Administração
        </p>

        <h1 class="mt-2 text-3xl font-bold text-gray-950">
          Mural
        </h1>

        <p class="mt-2 text-gray-600">
          Gere as publicações reais do mural através do Supabase.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-xl border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
          @click="handleReload"
        >
          Recarregar
        </button>

        <NuxtLink
          to="/admin/mural/novo"
          class="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
        >
          Nova publicação
        </NuxtLink>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Total"
        :value="totalPosts"
        description="Publicações criadas"
      />

      <AdminStatCard
        label="Publicadas"
        :value="publishedPosts"
        description="Visíveis no mural"
      />

      <AdminStatCard
        label="Rascunhos"
        :value="draftPosts"
        description="Ainda não publicados"
      />

      <AdminStatCard
        label="Categorias"
        :value="categoriesCount"
        description="Categorias diferentes"
      />
    </div>

    <div
      v-if="submitError"
      class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
    >
      <p class="font-bold">
        Erro
      </p>

      <p class="mt-2">
        {{ submitError }}
      </p>
    </div>

    <div
      v-if="successMessage"
      class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
    >
      <p class="font-bold">
        Ação concluída
      </p>

      <p class="mt-2">
        {{ successMessage }}
      </p>
    </div>

    <div class="mt-8 rounded-3xl border border-amber-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 p-6">
        <div class="grid gap-4 lg:grid-cols-[1fr_240px]">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Pesquisar por título, categoria ou conteúdo..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >

          <select
            v-model="selectedStatus"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option
              v-for="status in statusOptions"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="p-8 text-center text-gray-600"
      >
        A carregar publicações...
      </div>

      <div
        v-else-if="filteredPosts.length"
        class="divide-y divide-gray-200"
      >
        <article
          v-for="post in filteredPosts"
          :key="post.id"
          class="p-6"
        >
          <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex gap-5">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-4xl">
                {{ post.coverEmoji }}
              </div>

              <div>
                <div class="flex flex-wrap items-center gap-3">
                  <h2 class="text-xl font-bold text-gray-950">
                    {{ post.title }}
                  </h2>

                  <span
                    class="rounded-full border px-3 py-1 text-xs font-bold"
                    :class="getStatusClass(post.status)"
                  >
                    {{ getStatusLabel(post.status) }}
                  </span>
                </div>

                <p class="mt-2 max-w-3xl leading-7 text-gray-600">
                  {{ post.excerpt }}
                </p>

                <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                  <span>
                    {{ post.category }}
                  </span>

                  <span>
                    Criada em {{ formatDate(post.createdAt) }}
                  </span>

                  <span v-if="post.publishedAt">
                    Publicada em {{ formatDate(post.publishedAt) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-if="post.status === 'published'"
                :to="`/mural/${post.slug}`"
                target="_blank"
                class="rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
              >
                Ver no site
              </NuxtLink>

              <NuxtLink
                :to="`/admin/mural/${post.slug}/editar`"
                class="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Editar
              </NuxtLink>

              <button
                type="button"
                class="rounded-xl border border-sky-300 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSubmitting"
                @click="handleTogglePublication(post)"
              >
                {{ post.status === 'published' ? 'Despublicar' : 'Publicar' }}
              </button>

              <button
                type="button"
                class="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSubmitting"
                @click="handleDeletePost(post)"
              >
                Apagar
              </button>
            </div>
          </div>
        </article>
      </div>

      <SharedEmptyState
        v-else
        class="m-6"
        icon="🖼️"
        title="Nenhuma publicação encontrada"
        description="Ainda não existem publicações no Supabase ou os filtros selecionados não têm resultados."
        action-label="Criar publicação"
        action-to="/admin/mural/novo"
      />
    </div>
  </UContainer>
</template>