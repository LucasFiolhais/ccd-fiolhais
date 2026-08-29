<script setup lang="ts">
import { provideThemeContext } from '@nuxt/ui/runtime/composables/useComponentProps.js';
import { date } from 'zod';
import type { EventStatus } from '~/types/event';

const props = defineProps<{
  title: string
  date: string
  description: string
  location: string
  price: string
  status: string
  to: string
}>()

const statusInfo = computed(() => {
  if (props.status === 'open') {
    return {
      label: 'Aberto',
      class: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  }

  if (props.status === 'soon') {
    return {
      label: 'Em breve',
      class: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  if (props.status === 'sold_out') {
    return {
      label: 'Esgotado',
      class: 'bg-red-50 text-red-700 border-red-200'
    }
  }

  return {
    label: 'Fechado',
    class: 'bg-gray-50 text-gray-700 border-gray-200'
  }
})
</script>

<template>
  <article class="flex h-full flex-col rounded-2xl border border-amber-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-semibold text-amber-600">
          {{ props.date }}
        </p>

        <h3 class="mt-3 text-xl font-bold text-gray-950">
          {{ props.title }}
        </h3>
      </div>

      <span
        class="rounded-full border px-3 py-1 text-xs font-semibold"
        :class="statusInfo.class"
      >
        {{ statusInfo.label }}
      </span>
    </div>

    <p class="mt-5 flex-1 leading-7 text-gray-700">
      {{ props.description }}
    </p>

    <div class="mt-5 flex items-center justify-between gap-4 text-sm text-gray-600">
      <span>{{ props.location }}</span>
      <span>{{ props.price }}</span>
    </div>

    <NuxtLink
      :to="props.to"
      class="mt-6 inline-flex items-center justify-center rounded-xl border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-500 hover:text-black"
    >
      Ver detalhes
    </NuxtLink>
  </article>
</template>