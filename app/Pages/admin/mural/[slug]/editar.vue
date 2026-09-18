<script setup lang="ts">
import {
  useSupabaseAdminPosts,
  type AdminPost,
  type AdminPostStatus
} from '~/composables/useSupabaseAdminPosts'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()

const {
  getPostBySlug,
  updatePost
} = useSupabaseAdminPosts()

const post = ref<AdminPost | null>(null)

const isLoading = ref(true)
const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

const postSlug = computed(() => {
  return String(route.params.slug)
})

const form = reactive({
  title: '',
  excerpt: '',
  content: '',
  category: '',
  coverEmoji: '',
  status: 'draft' as AdminPostStatus
})

const errors = reactive({
  title: '',
  excerpt: '',
  content: '',
  category: '',
  coverEmoji: ''
})

const statusOptions: Array<{
  label: string
  value: AdminPostStatus
}> = [
  {
    label: 'Rascunho',
    value: 'draft'
  },
  {
    label: 'Publicada',
    value: 'published'
  }
]

useHead(() => {
  return {
    title: post.value
      ? `Editar ${post.value.title}`
      : 'Editar publicação'
  }
})

const clearErrors = () => {
  errors.title = ''
  errors.excerpt = ''
  errors.content = ''
  errors.category = ''
  errors.coverEmoji = ''
  submitError.value = ''
  successMessage.value = ''
}

const validateForm = () => {
  clearErrors()

  if (!form.title.trim()) {
    errors.title = 'O título é obrigatório.'
  }

  if (!form.excerpt.trim()) {
    errors.excerpt = 'O resumo é obrigatório.'
  }

  if (!form.content.trim()) {
    errors.content = 'O conteúdo é obrigatório.'
  }

  if (!form.category.trim()) {
    errors.category = 'A categoria é obrigatória.'
  }

  if (!form.coverEmoji.trim()) {
    errors.coverEmoji = 'O emoji é obrigatório.'
  }

  return (
    !errors.title &&
    !errors.excerpt &&
    !errors.content &&
    !errors.category &&
    !errors.coverEmoji
  )
}

const fillForm = (selectedPost: AdminPost) => {
  form.title = selectedPost.title
  form.excerpt = selectedPost.excerpt
  form.content = selectedPost.content
  form.category = selectedPost.category
  form.coverEmoji = selectedPost.coverEmoji
  form.status = selectedPost.status
}

const loadPost = async () => {
  isLoading.value = true
  submitError.value = ''
  successMessage.value = ''

  const result = await getPostBySlug(postSlug.value)

  isLoading.value = false

  if (!result.success) {
    submitError.value =
      result.error || 'Não foi possível carregar a publicação.'

    post.value = null
    return
  }

  post.value = result.post

  if (result.post) {
    fillForm(result.post)
  }
}

const handleSubmit = async () => {
  if (!post.value) {
    return
  }

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  const result = await updatePost(
    post.value.id,
    {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      category: form.category.trim(),
      coverEmoji: form.coverEmoji.trim(),
      status: form.status
    },
    post.value.publishedAt
  )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value =
      result.error || 'Não foi possível guardar as alterações.'

    return
  }

  successMessage.value =
    'Publicação atualizada com sucesso.'

  await loadPost()
}

const handleCancel = async () => {
  await navigateTo('/admin/mural')
}

onMounted(async () => {
  await loadPost()
})
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <NuxtLink
        to="/admin/mural"
        class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
      >
        ← Voltar ao mural
      </NuxtLink>
    </div>

    <div
      v-if="isLoading"
      class="rounded-3xl border border-amber-200 bg-white p-8 text-center text-gray-600 shadow-sm"
    >
      A carregar publicação...
    </div>

    <div
      v-else-if="submitError && !post"
      class="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
    >
      <p class="font-bold">
        Erro
      </p>

      <p class="mt-2">
        {{ submitError }}
      </p>
    </div>

    <div
      v-else-if="post"
      class="space-y-8"
    >
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
          Administração
        </p>

        <h1 class="mt-2 text-3xl font-bold text-gray-950">
          Editar publicação
        </h1>

        <p class="mt-2 text-gray-600">
          Atualiza o conteúdo guardado no Supabase.
        </p>
      </div>

      <div
        v-if="submitError"
        class="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
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
        class="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
      >
        <p class="font-bold">
          Alterações guardadas
        </p>

        <p class="mt-2">
          {{ successMessage }}
        </p>
      </div>

      <form
        class="rounded-3xl border border-amber-200 bg-white shadow-sm"
        @submit.prevent="handleSubmit"
      >
        <div class="border-b border-gray-200 p-6">
          <h2 class="text-2xl font-bold text-gray-950">
            Conteúdo
          </h2>

          <p class="mt-2 text-gray-600">
            O slug mantém-se inalterado para preservar a ligação pública existente.
          </p>
        </div>

        <div class="space-y-6 p-6">
          <div class="rounded-2xl bg-gray-50 p-4">
            <p class="text-sm font-semibold text-gray-500">
              Slug
            </p>

            <p class="mt-1 break-all text-gray-950">
              {{ post.slug }}
            </p>
          </div>

          <div class="grid gap-5 md:grid-cols-[120px_1fr]">
            <div>
              <label class="text-sm font-semibold text-gray-800">
                Emoji
              </label>

              <input
                v-model="form.coverEmoji"
                type="text"
                class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-center text-2xl text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                :class="errors.coverEmoji ? 'border-red-400' : 'border-gray-300'"
              >

              <p
                v-if="errors.coverEmoji"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors.coverEmoji }}
              </p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Título
              </label>

              <input
                v-model="form.title"
                type="text"
                class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                :class="errors.title ? 'border-red-400' : 'border-gray-300'"
              >

              <p
                v-if="errors.title"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors.title }}
              </p>
            </div>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <div>
              <label class="text-sm font-semibold text-gray-800">
                Categoria
              </label>

              <input
                v-model="form.category"
                type="text"
                class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                :class="errors.category ? 'border-red-400' : 'border-gray-300'"
              >

              <p
                v-if="errors.category"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors.category }}
              </p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Estado
              </label>

              <select
                v-model="form.status"
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
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

          <div>
            <label class="text-sm font-semibold text-gray-800">
              Resumo
            </label>

            <textarea
              v-model="form.excerpt"
              rows="3"
              class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              :class="errors.excerpt ? 'border-red-400' : 'border-gray-300'"
            />

            <p
              v-if="errors.excerpt"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.excerpt }}
            </p>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-800">
              Conteúdo completo
            </label>

            <textarea
              v-model="form.content"
              rows="12"
              class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              :class="errors.content ? 'border-red-400' : 'border-gray-300'"
            />

            <p
              v-if="errors.content"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.content }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-3 border-t border-gray-200 p-6 sm:flex-row sm:justify-between">
          <NuxtLink
            v-if="post.status === 'published'"
            :to="`/mural/${post.slug}`"
            target="_blank"
            class="rounded-xl border border-amber-300 px-5 py-3 text-center text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
          >
            Ver no site
          </NuxtLink>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              class="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              @click="handleCancel"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'A guardar...' : 'Guardar alterações' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <SharedEmptyState
      v-else
      icon="🖼️"
      title="Publicação não encontrada"
      description="Não existe nenhuma publicação com este slug no Supabase."
      action-label="Voltar ao mural"
      action-to="/admin/mural"
    />
  </UContainer>
</template>