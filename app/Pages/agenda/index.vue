<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'

const { getEvents } = useEvents()

const searchTerm = ref('')
const selectedCategory = ref('Todos')

const events = computed(() => {
  return getEvents()
})

const categoryOptions = computed(() => {
  const categories = events.value.map((event) => event.category)
  return ['Todos', ...new Set(categories)]
})

const filteredEvents = computed(() => {
  return events.value.filter((event) => {
    const matchesSearch = [
      event.title,
      event.description,
      event.location,
      event.category
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.value.toLowerCase())

    const matchesCategory =
      selectedCategory.value === 'Todos' ||
      event.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

const selectCategory = (category: string) => {
  selectedCategory.value = category
}
</script>

<template>
  <div>
    <section class="bg-gray-50 py-16">
      <UContainer>
        <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
          Agenda
        </p>

        <h1 class="mt-3 text-4xl font-bold text-gray-950">
          Eventos do CCD de Fiolhais
        </h1>

        <p class="mt-4 max-w-3xl text-lg leading-8 text-gray-700">
          Consulta os próximos convívios, festas, jantares e iniciativas da comunidade.
        </p>
      </UContainer>
    </section>

    <section class="py-12">
      <UContainer>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Pesquisar evento..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 lg:max-w-3xl"
          >

          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in categoryOptions"
              :key="category"
              type="button"
              class="rounded-xl border px-4 py-2 text-sm font-semibold transition"
              :class="selectedCategory === category
                ? 'border-amber-500 bg-amber-500 text-black'
                : 'border-amber-300 bg-white text-amber-700 hover:bg-amber-50'"
              @click="selectCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div
          v-if="filteredEvents.length"
          class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
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

        <SharedEmptyState
          v-else
          class="mt-8"
          icon="📅"
          title="Nenhum evento encontrado"
          description="Tenta pesquisar por outro nome ou categoria, ou volta mais tarde para consultar novos eventos."
          action-label="Ver todos os eventos"
          action-to="/agenda"
        />
      </UContainer>
    </section>
  </div>
</template>