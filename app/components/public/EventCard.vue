<script setup lang="ts">
import { provideThemeContext } from '@nuxt/ui/runtime/composables/useComponentProps.js';
import { date } from 'zod';

const props = defineProps<{
    title: string
    date: string
    description:string
    location: string
    price: string
    status: string
}>()

const statusColor = computed(() => {
    if (props.status === 'Aberto') return 'sucess'
    if (props.status === 'Encerrado') return 'warning'

    return 'neutral'
})
</script>

<template>
<UCard class="h-full">
    <template #header>
        <div class="flex items-start justify-between gap-4">
            <div>
                <p class="text-sm font-medium text-primary">
                    {{ date }}
                </p>

                <h3 class="mt-1 text-lg font-bold text-gray-950">
                    {{ title }}
                </h3>

            </div>

            <UBadge :color="statusColor" variant="soft">
                {{ status }}
            </UBadge>
        </div>
    </template>

    <p class="text-sm text-gray-600">
        {{ description }}
    </p>

    <div class="mt-5 flex items-center justify-between text-sm text-gray-500">
        <span>{{ location }}</span>
        <span>{{ price }}</span>
    </div>

    <template #footer>
        <UButton to="/agenda" variant="outline" block>
            Ver Detalhes
        </UButton>
    </template>

</UCard>
</template>