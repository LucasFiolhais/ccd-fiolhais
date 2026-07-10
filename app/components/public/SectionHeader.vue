<template>
    <div class="mx-auto max-w-2x1 text-center">
        <p v-if="eyebrow" class="text-sm font-semibold uppercase tracking-wide text-primay">
            {{ eyebrow }}
        </p>

        <h2 class="mt-3 text-3x1 font-bold travking-tight text-gray-950 sm:text-4x1">
            {{  title  }}
        </h2>

        <p v-if="description" class="mt-4 text-gray-600">
            {{ description }}
        </p>

    </div>
</template>
<script setup lang="ts">
defineProps<{
    eyebrow?: string
    title: string
    description?: string
}>()
</script>