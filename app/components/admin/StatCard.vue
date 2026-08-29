<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  description?: string
}>()
</script>

<template>
  <div class="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
    <div class="mb-5 h-1 w-12 rounded-full ccd-gold-gradient" />

    <p class="text-sm font-medium text-gray-600">
      {{ label }}
    </p>

    <p class="mt-3 text-3xl font-bold text-gray-950">
      {{ value }}
    </p>

    <p
      v-if="description"
      class="mt-2 text-sm text-gray-500"
    >
      {{ description }}
    </p>
  </div>
</template>