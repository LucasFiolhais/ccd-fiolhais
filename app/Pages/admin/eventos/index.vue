<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'

definePageMeta({
  layout: 'admin'
})

const { getEvents } = useEvents()

const events = getEvents()

const getStatusLabel = (status: string) => {
  if (status === 'open') return 'Aberto'
  if (status === 'soon') return 'Em breve'
  if (status === 'sold_out') return 'Esgotado'

  return 'Fechado'
}

const getStatusColor = (status: string) => {
  if (status === 'open') return 'success'
  if (status === 'soon') return 'warning'
  if (status === 'sold_out') return 'error'

  return 'neutral'
}
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">
          Eventos
        </p>

        <h1 class="mt-2 text-3xl font-bold text-gray-950">
          Gestão de eventos
        </h1>

        <p class="mt-2 text-gray-600">
          Criar eventos, gerir inscrições e consultar ocupação.
        </p>
      </div>

      <UButton>
        Novo evento
      </UButton>
    </div>

    <div class="grid gap-6">
      <UCard
        v-for="event in events"
        :key="event.id"
      >
        <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div class="flex gap-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
              {{ event.imageEmoji }}
            </div>

            <div>
              <div class="flex flex-wrap items-center gap-3">
                <h2 class="text-lg font-bold text-gray-950">
                  {{ event.title }}
                </h2>

                <UBadge
                  :color="getStatusColor(event.status)"
                  variant="soft"
                >
                  {{ getStatusLabel(event.status) }}
                </UBadge>
              </div>

              <p class="mt-1 text-sm text-gray-600">
                {{ event.date }} · {{ event.time }} · {{ event.location }}
              </p>

              <p class="mt-1 text-sm text-gray-500">
                Inscritos: {{ event.registered }} / {{ event.capacity }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              :to="`/agenda/${event.slug}`"
              variant="outline"
            >
              Ver página
            </UButton>

            <UButton variant="soft">
              Inscritos
            </UButton>

            <UButton>
              Editar
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>