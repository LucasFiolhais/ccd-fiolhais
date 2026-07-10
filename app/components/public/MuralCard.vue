<script setup lang="ts">
    defineProps<{
        title: string
        category: string
        description: string
        emoji: string
    }>()
</script>

<template>
    <UCard class="h-full overflow-hidden">
        <div class="mb-5 flex h-40 items-center justify-center rounded-xl bg-gray-100">
            <span class="text-4x1">
                {{emoji}}
            </span>
        </div>

        <p class="text-sm font-medium text-primary">
            {{ category }}
        </p>

        <h3 class="mt-2 text-lg font-bold text-gray-950">
            {{ title }}
        </h3>

        <p class="mt-3 text-sm text-gray-600">
            {{ description }}
        </p>

        <template #footer>
            <UButton to="/mural" variant="link" class="px-0">
                Ver no Mural
            </UButton>
        </template>

    </UCard>
</template>