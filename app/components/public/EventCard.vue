<script setup lang="ts">
import { provideThemeContext } from '@nuxt/ui/runtime/composables/useComponentProps.js';
import { date } from 'zod';
import type { EventStatus } from '~/types/event';

const props = defineProps<{
    title: string
    date: string
    description:string
    location: string
    price: string
    status: EventStatus
    to: string
}>()

const statusLabel = computed(() => {
    if (props.status === 'open') return 'Aberto'
    if (props.status === 'soon') return 'Em breve'
    if (props.status === 'sold_out') return 'Esgotado'

    return 'Fechado'
})

const statusColor = computed(() => {
    if (props.status === 'open') return 'success'
    if (props.status === 'soon') return 'warning'
    if (props.status === 'sold_out') return 'error'

    return 'neutral'
})
</script>

<template>
<UCard class="h-full">
    <template #header>
        <div class="flex items-start justify-between gap-4">
            <div>
                <p class="text-sm font-medium text-primary">
                    {{ props.date }}
                </p>

                <h3 class="mt-1 text-lg font-bold text-gray-950">
                    {{ props.title }}
                </h3>

            </div>

            <UBadge :color="statusColor" variant="soft">
                {{ statusLabel }}
            </UBadge>
        </div>
    </template>

    <p class="text-sm text-gray-600">
        {{ props.description }}
    </p>

    <div class="mt-5 flex items-center justify-between text-sm text-gray-500">
        <span>{{ props.location }}</span>
        <span>{{ props.price }}</span>
    </div>

    <template #footer>
        <UButton :to="to" variant="outline" block>
            Ver Detalhes
        </UButton>
    </template>

</UCard>
</template>