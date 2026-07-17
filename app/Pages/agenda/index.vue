<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'
const { getEvents } = useEvents()

const search = ref('')
const selectedCategory = ref('Todos')

const events = getEvents()

const categories = computed(() => {
  return ['Todos', ...new Set(events.map((event) => event.category))]
})

const filteredEvents = computed(() => {
  return events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(search.value.toLowerCase())

    const matchesCategory =
      selectedCategory.value === 'Todos' ||
      event.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})
</script>

<template>
  <div>
    <section class="bg-gray-50">
      <UContainer class="py-16">
        <div class="max-w-3xl">
          <p class="text-sm font-semibold uppercase tracking-wide text-primary">
            Agenda
          </p>

          <h1 class="mt-3 text-4xl font-bold tracking-tight text-gray-950">
            Eventos do CCD de Fiolhais
          </h1>

          <p class="mt-4 text-lg text-gray-600">
            Consulta os próximos convívios, festas, jantares e iniciativas da comunidade.
          </p>
        </div>
      </UContainer>
    </section>

    <section class="py-12">
      <UContainer>
        <div class="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <UInput
            v-model="search"
            placeholder="Pesquisar evento..."
            size="lg"
          />

          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="category in categories"
              :key="category"
              :variant="selectedCategory === category ? 'solid' : 'outline'"
              @click="selectedCategory = category"
            >
              {{ category }}
            </UButton>
          </div>
        </div>

        <div
          v-if="filteredEvents.length"
          class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <PublicEventCard
            v-for="event in filteredEvents"
            :key="event.id"
            :title="event.title"
            :date="event.date"
            :description="event.description"
            :location="event.location"
            :price="event.priceMember"
            :status="event.status"
            :to="`/agenda/${event.slug}`"
          />
        </div>

        <UCard
          v-else
          class="text-center"
        >
          <p class="font-medium">
            Nenhum evento encontrado.
          </p>

          <p class="mt-2 text-sm text-gray-600">
            Tenta pesquisar por outro nome ou categoria.
          </p>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>
