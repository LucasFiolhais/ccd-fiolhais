<script setup lang="ts">
defineProps<{
  title: string
  category: string
  description: string
  emoji: string
  to: string
}>()
</script>

<template>
  <article class="flex h-full flex-col overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
    <div class="flex h-40 items-center justify-center bg-gray-50 text-5xl">
      {{ emoji }}
    </div>

    <div class="flex flex-1 flex-col p-6">
      <p class="text-sm font-semibold text-amber-600">
        {{ category }}
      </p>

      <h3 class="mt-3 text-xl font-bold text-gray-950">
        {{ title }}
      </h3>

      <p class="mt-3 flex-1 leading-7 text-gray-700">
        {{ description }}
      </p>

      <NuxtLink
        :to="to"
        class="mt-6 inline-flex items-center justify-center rounded-xl border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-500 hover:text-black"
      >
        Ver no mural
      </NuxtLink>
    </div>
  </article>
</template>