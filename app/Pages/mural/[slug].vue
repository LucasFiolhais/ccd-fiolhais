<script setup lang="ts">
import { usePosts } from '~/composables/usePosts'
import { useSupabasePosts } from '~/composables/useSupabasePosts'

const route = useRoute()

const { getPostBySlug } = usePosts()
const { getPublishedPostBySlug } = useSupabasePosts()

const slug = computed(() => {
  return String(route.params.slug)
})

const {
  data: supabasePost,
  pending
} = await useAsyncData(`public-post-${slug.value}`, () => {
  return getPublishedPostBySlug(slug.value)
})

const mockPost = computed(() => {
  return getPostBySlug(slug.value)
})

const post = computed(() => {
  return supabasePost.value || mockPost.value || null
})

const isUsingSupabase = computed(() => {
  return Boolean(supabasePost.value)
})

useHead(() => {
  return {
    title: post.value?.title || 'Publicação'
  }
})
</script>

<template>
  <div>
    <section class="bg-gray-50 py-16">
      <UContainer>
        <NuxtLink
          to="/mural"
          class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
        >
          ← Voltar ao mural
        </NuxtLink>

        <div
          v-if="pending"
          class="mt-8 rounded-2xl border border-amber-200 bg-white p-8 text-gray-700 shadow-sm"
        >
          A carregar publicação...
        </div>

        <article
          v-else-if="post"
          class="mt-8"
        >
          <div class="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
                {{ post.category }}
              </p>

              <h1 class="mt-3 text-4xl font-bold text-gray-950">
                {{ post.title }}
              </h1>

              <p class="mt-4 text-lg leading-8 text-gray-700">
                {{ post.excerpt }}
              </p>

              <p class="mt-4 text-sm text-gray-500">
                Publicado em {{ post.publishedAt || post.createdAt }}
              </p>

              <div
                v-if="isUsingSupabase"
                class="mt-6 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
              >
                Publicação carregada da base de dados oficial
              </div>

              <div
                v-else
                class="mt-6 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800"
              >
                Publicação de demonstração
              </div>
            </div>

            <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
              <div class="flex h-56 items-center justify-center rounded-2xl bg-gray-50 text-7xl">
                {{ post.coverEmoji }}
              </div>

              <div class="mt-6 rounded-2xl bg-gray-50 p-4">
                <p class="text-sm text-gray-500">
                  Categoria
                </p>

                <p class="mt-1 font-semibold text-gray-950">
                  {{ post.category }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-10 rounded-3xl border border-amber-200 bg-white p-8 leading-8 text-gray-700 shadow-sm">
            <div class="whitespace-pre-line">
              {{ post.content }}
            </div>
          </div>
        </article>

        <SharedEmptyState
          v-else
          class="mt-8"
          icon="🖼️"
          title="Publicação não encontrada"
          description="A publicação que procuras não existe, ainda não está publicada ou foi removida."
          action-label="Voltar ao mural"
          action-to="/mural"
        />
      </UContainer>
    </section>
  </div>
</template>