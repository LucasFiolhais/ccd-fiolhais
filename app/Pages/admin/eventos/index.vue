<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'
import type { EventStatus } from '~/types/event'

definePageMeta({
  layout: 'admin'
})

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const {
  getEvents,
  getEventRegisteredCount,
  getEventPendingPaymentsCount
} = useEvents()

const search = ref('')
const selectedStatus = ref('Todos')

const events = getEvents()

const statusOptions = ['Todos', 'Aberto', 'Em breve', 'Esgotado', 'Fechado']

const getStatusLabel = (status: EventStatus) => {
  if (status === 'open') return 'Aberto'
  if (status === 'soon') return 'Em breve'
  if (status === 'sold_out') return 'Esgotado'

  return 'Fechado'
}

const getStatusColor = (status: EventStatus): BadgeColor => {
  if (status === 'open') return 'success'
  if (status === 'soon') return 'warning'
  if (status === 'sold_out') return 'error'

  return 'neutral'
}

const filteredEvents = computed(() => {
  return events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.value.toLowerCase()) ||
      event.category.toLowerCase().includes(search.value.toLowerCase())

    const matchesStatus =
      selectedStatus.value === 'Todos' ||
      getStatusLabel(event.status) === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

const totalEvents = computed(() => events.length)

const openEvents = computed(() => {
  return events.filter((event) => event.status === 'open').length
})

const totalRegistrations = computed(() => {
  return events.reduce((total, event) => total + getEventRegisteredCount(event.id), 0)
})
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
          Criar eventos, consultar inscritos e acompanhar pagamentos.
        </p>
      </div>

      <UButton>
        Novo evento
      </UButton>
    </div>

    <div class="mb-8 grid gap-6 md:grid-cols-3">
      <AdminStatCard
        label="Total de eventos"
        :value="totalEvents"
        description="Eventos criados no sistema"
      />

      <AdminStatCard
        label="Eventos abertos"
        :value="openEvents"
        description="Eventos com inscrições ativas"
      />

      <AdminStatCard
        label="Lugares inscritos"
        :value="totalRegistrations"
        description="Total de lugares reservados"
      />
    </div>

    <UCard>
      <div class="mb-6 grid gap-4 md:grid-cols-[1fr_220px]">
        <UInput
          v-model="search"
          placeholder="Pesquisar por evento ou categoria..."
          size="lg"
        />

        <USelect
          v-model="selectedStatus"
          :items="statusOptions"
          size="lg"
        />
      </div>

      <div class="grid gap-5">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="rounded-2xl border border-gray-200 p-5"
        >
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex gap-4">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
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
                  Inscritos:
                  {{ getEventRegisteredCount(event.id) }} / {{ event.capacity }}
                  · Pagamentos pendentes:
                  {{ getEventPendingPaymentsCount(event.id) }}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                :to="`/agenda/${event.slug}`"
                variant="outline"
              >
                Ver página pública
              </UButton>

              <UButton
                :to="`/admin/eventos/${event.slug}`"
              >
                Gerir evento
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!filteredEvents.length"
        class="py-10 text-center"
      >
        <p class="font-medium text-gray-950">
          Nenhum evento encontrado.
        </p>

        <p class="mt-1 text-sm text-gray-500">
          Tenta alterar a pesquisa ou o filtro.
        </p>
      </div>
    </UCard>
  </UContainer>
</template>