<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}>()
</script>

<template>
  <div class="rounded-2xl border border-dashed border-amber-300 bg-white p-10 text-center">
    <div
      v-if="icon"
      class="mx-auto flex h-16 w-16 items-center justify-center rounded-full ccd-gold-gradient text-3xl"
    >
      {{ icon }}
    </div>

    <h2 class="mt-4 text-xl font-bold text-gray-950">
      {{ title }}
    </h2>

    <p class="mx-auto mt-2 max-w-md text-sm text-gray-600">
      {{ description }}
    </p>

    <UButton
      v-if="actionLabel && actionTo"
      :to="actionTo"
      class="mt-6"
    >
      {{ actionLabel }}
    </UButton>
  </div>
</template>