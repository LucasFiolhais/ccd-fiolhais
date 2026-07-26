<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  description?: string
}>()
</script>

<template>
  <UCard>
    <p class="text-sm font-medium text-gray-500">
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
  </UCard>
</template>