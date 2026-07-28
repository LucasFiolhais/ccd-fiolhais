<script setup lang="ts">
import { usePosts } from '~/composables/usePosts'

const route = useRoute()
const { getPostBySlug } = usePosts()

const post = computed(() => {
  return getPostBySlug(String(route.params.slug))
})
</script>

<template>
  <UContainer class="py-12">
    <UButton
      to="/mural"
      variant="link"
      class="mb-8 px-0"
    >
      ← Voltar ao mural
    </UButton>

    <article
      v-if="post && post.status === 'published'"
      class="mx-auto max-w-3xl"
    >
      <div class="mb-8 flex h-72 items-center justify-center rounded-3xl bg-gray-100 text-8xl">
        {{ post.coverEmoji }}
      </div>

      <p class="text-sm font-semibold uppercase tracking-wide text-primary">
        {{ post.category }}
      </p>

      <h1 class="mt-3 text-4xl font-bold tracking-tight text-gray-950">
        {{ post.title }}
      </h1>

      <p class="mt-3 text-sm text-gray-500">
        Publicado em {{ post.publishedAt }}
      </p>

      <p class="mt-6 text-xl leading-8 text-gray-600">
        {{ post.excerpt }}
      </p>

      <div class="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <p class="whitespace-pre-line leading-8 text-gray-700">
          {{ post.content }}
        </p>
      </div>

      <div
        v-if="post.media.length"
        class="mt-8 grid gap-4 md:grid-cols-2"
      >
        <UCard
          v-for="media in post.media"
          :key="media.id"
        >
          <p class="text-sm text-gray-600">
            {{ media.caption || media.url }}
          </p>
        </UCard>
      </div>
    </article>

    <UCard
      v-else
      class="text-center"
    >
      <h1 class="text-2xl font-bold text-gray-950">
        Publicação não encontrada
      </h1>

      <p class="mt-2 text-gray-600">
        A publicação que procuras não existe ou ainda não está publicada.
      </p>

      <UButton
        to="/mural"
        class="mt-6"
      >
        Voltar ao mural
      </UButton>
    </UCard>
  </UContainer>
</template>