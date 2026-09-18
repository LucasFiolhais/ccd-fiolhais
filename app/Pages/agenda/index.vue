<script setup lang="ts">
import {
  useSupabasePublicEvents,
  type PublicEvent,
  type PublicEventStatus
} from '~/composables/useSupabasePublicEvents'

useHead({
  title: 'Agenda'
})

const { getPublishedEvents } = useSupabasePublicEvents()

const events = ref<PublicEvent[]>([])
const searchTerm = ref('')
const selectedCategory = ref('all')

const isLoading = ref(true)
const loadError = ref('')

const getStatusLabel = (
  status: PublicEventStatus
) => {
  if (status === 'open') {
    return 'Inscrições abertas'
  }

  if (status === 'soon') {
    return 'Brevemente'
  }

  if (status === 'sold_out') {
    return 'Esgotado'
  }

  if (status === 'closed') {
    return 'Fechado'
  }

  return 'Rascunho'
}

const getStatusClass = (
  status: PublicEventStatus
) => {
  if (status === 'open') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'soon') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  if (status === 'sold_out') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  return 'border-gray-200 bg-gray-50 text-gray-600'
}

const formatEventDate = (
  event: PublicEvent
) => {
  if (!event.eventDate) {
    return event.dateLabel
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(
    new Date(`${event.eventDate}T00:00:00`)
  )
}

const categories = computed(() => {
  return [
    'all',
    ...new Set(
      events.value
        .map((event) => event.category)
        .filter(Boolean)
    )
  ]
})

const filteredEvents = computed(() => {
  const search = searchTerm.value
    .trim()
    .toLowerCase()

  return events.value.filter((event) => {
    const matchesSearch = [
      event.title,
      event.description,
      event.category,
      event.location,
      event.dateLabel
    ]
      .join(' ')
      .toLowerCase()
      .includes(search)

    const matchesCategory =
      selectedCategory.value === 'all' ||
      event.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

const loadEvents = async () => {
  isLoading.value = true
  loadError.value = ''

  const result = await getPublishedEvents()

  isLoading.value = false

  if (!result.success) {
    loadError.value =
      result.error ||
      'Não foi possível carregar os eventos.'

    return
  }

  events.value = result.events
}

const handleReload = async () => {
  await loadEvents()
}

onMounted(async () => {
  await loadEvents()
})
</script>

<template>
  <div>
    <section class="bg-[#080808] py-16 text-white">
      <UContainer>
        <p class="text-sm font-bold uppercase tracking-[0.18em] text-amber-400">
          CCD Fiolhais
        </p>

        <h1 class="mt-3 text-4xl font-black sm:text-5xl">
          Agenda
        </h1>

        <p class="mt-5 max-w-2xl text-lg leading-8 text-gray-300">
          Consulta os próximos eventos e atividades promovidos
          pelo Centro Cultural e Desportivo de Fiolhais.
        </p>
      </UContainer>
    </section>

    <section class="bg-[#f8f4ea] py-12">
      <UContainer>
        <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
          <div class="grid gap-4 lg:grid-cols-[1fr_260px_auto]">
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Pesquisar eventos..."
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >

            <select
              v-model="selectedCategory"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >
              <option value="all">
                Todas as categorias
              </option>

              <option
                v-for="category in categories.filter((category) => category !== 'all')"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>

            <button
              type="button"
              class="rounded-xl border border-amber-500 px-5 py-3 font-semibold text-amber-700 transition hover:bg-amber-50"
              @click="handleReload"
            >
              Atualizar
            </button>
          </div>
        </div>
      </UContainer>
    </section>

    <section class="bg-white py-16">
      <UContainer>
        <div
          v-if="isLoading"
          class="rounded-3xl border border-amber-200 bg-gray-50 p-10 text-center text-gray-600"
        >
          A carregar eventos...
        </div>

        <div
          v-else-if="loadError"
          class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"
        >
          <p class="font-bold">
            Não foi possível carregar a agenda.
          </p>

          <p class="mt-2">
            {{ loadError }}
          </p>
        </div>

        <div
          v-else-if="filteredEvents.length"
          class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          <article
            v-for="event in filteredEvents"
            :key="event.id"
            class="flex flex-col overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div class="flex h-44 items-center justify-center bg-gray-50 text-7xl">
              {{ event.imageEmoji }}
            </div>

            <div class="flex flex-1 flex-col p-6">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wide text-amber-600">
                  {{ event.category }}
                </span>

                <span
                  class="rounded-full border px-2.5 py-1 text-xs font-bold"
                  :class="getStatusClass(event.status)"
                >
                  {{ getStatusLabel(event.status) }}
                </span>
              </div>

              <h2 class="mt-4 text-2xl font-bold text-gray-950">
                {{ event.title }}
              </h2>

              <p class="mt-3 leading-7 text-gray-600">
                {{ event.description }}
              </p>

              <div class="mt-5 space-y-2 text-sm text-gray-600">
                <p>
                  📅 {{ formatEventDate(event) }}
                </p>

                <p>
                  🕒
                  {{ event.timeLabel || event.eventTime || 'Hora a anunciar' }}
                </p>

                <p>
                  📍 {{ event.location }}
                </p>
              </div>

              <div class="mt-auto pt-6">
                <NuxtLink
                  :to="`/agenda/${event.slug}`"
                  class="inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
                >
                  Ver evento
                </NuxtLink>
              </div>
            </div>
          </article>
        </div>

        <SharedEmptyState
          v-else
          icon="📅"
          title="Nenhum evento encontrado"
          description="Não existem eventos publicados que correspondam à pesquisa."
        />
      </UContainer>
    </section>
  </div>
</template>