<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'

const route = useRoute()
const { getEventBySlug } = useEvents()

const showRegistrationForm = ref(false)

const openRegistrationForm = () => {
  showRegistrationForm.value = true
}

const event = computed(() => {
  return getEventBySlug(String(route.params.slug))
})

const statusLabel = computed(() => {
  if (!event.value) return ''

  if (event.value.status === 'open') return 'Aberto'
  if (event.value.status === 'soon') return 'Em breve'
  if (event.value.status === 'sold_out') return 'Esgotado'

  return 'Fechado'
})

const statusColor = computed(() => {
  if (!event.value) return 'neutral'

  if (event.value.status === 'open') return 'success'
  if (event.value.status === 'soon') return 'warning'
  if (event.value.status === 'sold_out') return 'error'

  return 'neutral'
})
</script>

<template>
  <div>
    <section class="bg-gray-50">
      <UContainer class="py-16">
        <UButton
          to="/agenda"
          variant="link"
          class="mb-8 px-0"
        >
          ← Voltar à agenda
        </UButton>

        <div
          v-if="event"
          class="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start"
        >
          <div>
            <div class="mb-6 flex h-64 items-center justify-center rounded-3xl bg-white text-7xl shadow-sm">
              {{ event.imageEmoji }}
            </div>

            <p class="text-sm font-semibold uppercase tracking-wide text-primary">
              {{ event.category }}
            </p>

            <h1 class="mt-3 text-4xl font-bold tracking-tight text-gray-950">
              {{ event.title }}
            </h1>

            <p class="mt-5 text-lg leading-8 text-gray-600">
              {{ event.longDescription }}
            </p>
          </div>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between gap-4">
                <h2 class="text-xl font-bold">
                  Informações do evento
                </h2>

                <UBadge
                  :color="statusColor"
                  variant="soft"
                >
                  {{ statusLabel }}
                </UBadge>
              </div>
            </template>

            <div class="space-y-4 text-sm">
              <div class="flex justify-between gap-4">
                <span class="text-gray-500">Data</span>
                <span class="font-medium text-gray-950">{{ event.date }}</span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-gray-500">Hora</span>
                <span class="font-medium text-gray-950">{{ event.time }}</span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-gray-500">Local</span>
                <span class="font-medium text-gray-950">{{ event.location }}</span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-gray-500">Preço sócio</span>
                <span class="font-medium text-gray-950">{{ event.priceMember }}</span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-gray-500">Preço não sócio</span>
                <span class="font-medium text-gray-950">{{ event.priceNonMember }}</span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-gray-500">Capacidade</span>
                <span class="font-medium text-gray-950">
                  {{ event.registered }} / {{ event.capacity }}
                </span>
              </div>
            </div>

            <template #footer>
              <div class="space-y-3">
                <UButton
                  v-if="event.status === 'open'"
                  block
                  size="lg"
                  @click="openRegistrationForm"
                >
                  Inscrever-me
                </UButton>

                <p
                  v-else
                  class="text-center text-xs text-gray-500"
                >
                  As inscrições ainda não estão disponíveis.
                </p>
              </div>
            </template>
          </UCard>

          <div
            v-if="showRegistrationForm && event.status === 'open'"
            class="lg:col-span-2"
          >
            <PublicEventRegistrationForm :event-title="event.title" />
          </div>
        </div>

        <UCard
          v-else
          class="text-center"
        >
          <h1 class="text-2xl font-bold">
            Evento não encontrado
          </h1>

          <p class="mt-2 text-gray-600">
            O evento que procuras não existe ou foi removido.
          </p>

          <UButton
            to="/agenda"
            class="mt-6"
          >
            Voltar à agenda
          </UButton>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>