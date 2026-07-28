<script setup lang="ts">
import { usePosts } from '~/composables/usePosts'
import type { PostStatus } from '~/types/post'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { createPost } = usePosts()

const form = reactive({
  title: '',
  excerpt: '',
  content: '',
  category: '',
  coverEmoji: '📸',
  status: 'draft' as PostStatus
})

const errors = reactive({
  title: '',
  excerpt: '',
  content: '',
  category: ''
})

const categoryOptions = [
  'Fotografias',
  'Comunidade',
  'Cultura',
  'Eventos',
  'Tradição',
  'Desporto',
  'Outro'
]

const emojiOptions = [
  '📸',
  '🍽️',
  '🌰',
  '🎤',
  '🏡',
  '🎉',
  '📝',
  '⚽'
]

const statusOptions = [
  {
    label: 'Rascunho',
    value: 'draft'
  },
  {
    label: 'Publicado',
    value: 'published'
  }
]

const clearErrors = () => {
  errors.title = ''
  errors.excerpt = ''
  errors.content = ''
  errors.category = ''
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

  return (
    !errors.title &&
    !errors.excerpt &&
    !errors.content &&
    !errors.category
  )
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  createPost({
    title: form.title,
    excerpt: form.excerpt,
    content: form.content,
    category: form.category,
    coverEmoji: form.coverEmoji,
    status: form.status
  })

  await router.push('/admin/mural')
}
</script>

<template>
  <UContainer class="py-10">
    <UButton
      to="/admin/mural"
      variant="link"
      class="mb-6 px-0"
    >
      ← Voltar ao mural
    </UButton>

    <div class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">
        Nova publicação
      </p>

      <h1 class="mt-2 text-3xl font-bold text-gray-950">
        Criar publicação
      </h1>

      <p class="mt-2 text-gray-600">
        Cria uma publicação para o mural. Mais tarde será possível adicionar fotografias e vídeos reais.
      </p>
    </div>

    <form
      class="grid gap-8 lg:grid-cols-[1fr_360px]"
      @submit.prevent="handleSubmit"
    >
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Conteúdo
            </h2>
          </template>

          <div class="space-y-5">
            <UFormField
              label="Título"
              :error="errors.title"
            >
              <UInput
                v-model="form.title"
                placeholder="Ex: Rescaldo do Magusto"
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Resumo"
              :error="errors.excerpt"
            >
              <UTextarea
                v-model="form.excerpt"
                placeholder="Pequeno resumo que aparece no cartão do mural."
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Conteúdo"
              :error="errors.content"
            >
              <UTextarea
                v-model="form.content"
                placeholder="Texto completo da publicação."
                size="lg"
                :rows="10"
              />
            </UFormField>
          </div>
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Definições
            </h2>
          </template>

          <div class="space-y-5">
            <UFormField
              label="Categoria"
              :error="errors.category"
            >
              <USelect
                v-model="form.category"
                :items="categoryOptions"
                placeholder="Escolher categoria"
                size="lg"
              />
            </UFormField>

            <UFormField label="Estado">
              <USelect
                v-model="form.status"
                :items="statusOptions"
                size="lg"
              />
            </UFormField>

            <UFormField label="Ícone">
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="emoji in emojiOptions"
                  :key="emoji"
                  type="button"
                  class="rounded-xl border p-3 text-2xl transition hover:bg-gray-50"
                  :class="form.coverEmoji === emoji
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200'"
                  @click="form.coverEmoji = emoji"
                >
                  {{ emoji }}
                </button>
              </div>
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Pré-visualização
            </h2>
          </template>

          <div class="rounded-2xl border border-gray-200 p-5">
            <div class="flex h-24 items-center justify-center rounded-xl bg-gray-100 text-5xl">
              {{ form.coverEmoji }}
            </div>

            <p class="mt-4 text-sm font-medium text-primary">
              {{ form.category || 'Categoria' }}
            </p>

            <h3 class="mt-1 text-lg font-bold text-gray-950">
              {{ form.title || 'Título da publicação' }}
            </h3>

            <p class="mt-2 text-sm text-gray-600">
              {{ form.excerpt || 'Resumo da publicação.' }}
            </p>
          </div>

          <template #footer>
            <UButton
              type="submit"
              size="lg"
              block
            >
              Criar publicação
            </UButton>
          </template>
        </UCard>
      </div>
    </form>
  </UContainer>
</template>