<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const posts = [
  {
    title: 'Memórias dos convívios',
    category: 'Fotografias',
    status: 'Rascunho'
  },
  {
    title: 'Rescaldo do Almoço Comunitário',
    category: 'Comunidade',
    status: 'Rascunho'
  }
]
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

      <UButton>
        Nova publicação
      </UButton>
    </div>

    <div class="grid gap-6">
      <UCard
        v-for="post in posts"
        :key="post.title"
      >
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="font-bold text-gray-950">
              {{ post.title }}
            </h2>

            <p class="mt-1 text-sm text-gray-600">
              {{ post.category }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <UBadge variant="soft">
              {{ post.status }}
            </UBadge>

            <UButton variant="outline">
              Editar
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>