<script setup lang="ts">
import {
  useSupabaseAdminEvents,
  type AdminEvent,
  type AdminEventStatus
} from '~/composables/useSupabaseAdminEvents'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Eventos'
})

type StatusFilter = 'all' | AdminEventStatus
type PublicationFilter = 'all' | 'published' | 'draft'

const {
  getEvents,
  updateEventStatus,
  updateEventPublication,
  deleteEvent
} = useSupabaseAdminEvents()

const events = ref<AdminEvent[]>([])
const searchTerm = ref('')
const selectedStatus = ref<StatusFilter>('all')
const selectedPublication = ref<PublicationFilter>('all')
const isLoading = ref(true)
const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

const statusOptions: Array<{
  label: string
  value: StatusFilter
}> = [
  {
    label: 'Todos',
    value: 'all'
  },
  {
    label: 'Rascunho',
    value: 'draft'
  },
  {
    label: 'Aberto',
    value: 'open'
  },
  {
    label: 'Brevemente',
    value: 'soon'
  },
  {
    label: 'Esgotado',
    value: 'sold_out'
  },
  {
    label: 'Fechado',
    value: 'closed'
  }
]

const publicationOptions: Array<{
  label: string
  value: PublicationFilter
}> = [
  {
    label: 'Todos',
    value: 'all'
  },
  {
    label: 'Publicados',
    value: 'published'
  },
  {
    label: 'Não publicados',
    value: 'draft'
  }
]

const getStatusLabel = (status: AdminEventStatus) => {
  if (status === 'draft') {
    return 'Rascunho'
  }

  if (status === 'open') {
    return 'Aberto'
  }

  if (status === 'soon') {
    return 'Brevemente'
  }

  if (status === 'sold_out') {
    return 'Esgotado'
  }

  return 'Fechado'
}

const getStatusClass = (status: AdminEventStatus) => {
  if (status === 'open') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'soon') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  if (status === 'sold_out') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  if (status === 'closed') {
    return 'border-gray-200 bg-gray-50 text-gray-600'
  }

  return 'border-sky-200 bg-sky-50 text-sky-700'
}

const formatDate = (value?: string) => {
  if (!value) {
    return 'Data a anunciar'
  }

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short'
  }).format(new Date(`${value}T00:00:00`))
}

const totalEvents = computed(() => {
  return events.value.length
})

const publishedEvents = computed(() => {
  return events.value.filter((event) => event.isPublished).length
})

const openEvents = computed(() => {
  return events.value.filter((event) => event.status === 'open').length
})

const totalRegisteredSeats = computed(() => {
  return events.value.reduce((total, event) => {
    return total + event.registeredSeats
  }, 0)
})

const filteredEvents = computed(() => {
  return events.value.filter((event) => {
    const searchValue = searchTerm.value.toLowerCase()

    const matchesSearch = [
      event.title,
      event.description,
      event.location,
      event.category,
      event.dateLabel
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchValue)

    const matchesStatus =
      selectedStatus.value === 'all' ||
      event.status === selectedStatus.value

    const matchesPublication =
      selectedPublication.value === 'all' ||
      (
        selectedPublication.value === 'published' &&
        event.isPublished
      ) ||
      (
        selectedPublication.value === 'draft' &&
        !event.isPublished
      )

    return matchesSearch && matchesStatus && matchesPublication
  })
})

const loadEvents = async () => {
  isLoading.value = true
  submitError.value = ''
  successMessage.value = ''

  const result = await getEvents()

  isLoading.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível carregar os eventos.'
    return
  }

  events.value = result.events
}

const handleReload = async () => {
  await loadEvents()
}

const handleUpdateStatus = async (
  eventId: string,
  status: AdminEventStatus
) => {
  submitError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  const result = await updateEventStatus(eventId, status)

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível atualizar o estado do evento.'
    return
  }

  successMessage.value = 'Estado do evento atualizado com sucesso.'
  await loadEvents()
}

const handleTogglePublication = async (event: AdminEvent) => {
  submitError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  const result = await updateEventPublication(event.id, !event.isPublished)

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível atualizar a publicação do evento.'
    return
  }

  successMessage.value = event.isPublished
    ? 'Evento removido do site público.'
    : 'Evento publicado no site público.'

  await loadEvents()
}

const handleDeleteEvent = async (event: AdminEvent) => {
  const confirmed = confirm(`Tens a certeza que queres apagar o evento "${event.title}"?`)

  if (!confirmed) {
    return
  }

  submitError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  const result = await deleteEvent(event.id)

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível apagar o evento.'
    return
  }

  successMessage.value = 'Evento apagado com sucesso.'
  await loadEvents()
}

onMounted(async () => {
  await loadEvents()
})
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
          Administração
        </p>

        <h1 class="mt-2 text-3xl font-bold text-gray-950">
          Eventos
        </h1>

        <p class="mt-2 text-gray-600">
          Gere os eventos reais guardados no Supabase.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-xl border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
          @click="handleReload"
        >
          Recarregar
        </button>

        <NuxtLink
          to="/admin/eventos/novo"
          class="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
        >
          Novo evento
        </NuxtLink>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Total"
        :value="totalEvents"
        description="Eventos criados"
      />

      <AdminStatCard
        label="Publicados"
        :value="publishedEvents"
        description="Visíveis no site público"
      />

      <AdminStatCard
        label="Abertos"
        :value="openEvents"
        description="Com inscrições abertas"
      />

      <AdminStatCard
        label="Lugares inscritos"
        :value="totalRegisteredSeats"
        description="Total de participantes"
      />
    </div>

    <div
      v-if="submitError"
      class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
    >
      <p class="font-bold">
        Erro
      </p>

      <p class="mt-2">
        {{ submitError }}
      </p>
    </div>

    <div
      v-if="successMessage"
      class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
    >
      <p class="font-bold">
        Ação concluída
      </p>

      <p class="mt-2">
        {{ successMessage }}
      </p>
    </div>

    <div class="mt-8 rounded-3xl border border-amber-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 p-6">
        <div class="grid gap-4 xl:grid-cols-[1fr_220px_220px]">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Pesquisar por título, local, categoria ou descrição..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >

          <select
            v-model="selectedStatus"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option
              v-for="status in statusOptions"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>

          <select
            v-model="selectedPublication"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option
              v-for="publication in publicationOptions"
              :key="publication.value"
              :value="publication.value"
            >
              {{ publication.label }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="p-8 text-center text-gray-600"
      >
        A carregar eventos...
      </div>

      <div
        v-else-if="filteredEvents.length"
        class="overflow-x-auto"
      >
        <table class="w-full min-w-[1100px] text-left">
          <thead class="border-b border-gray-200 bg-gray-50 text-sm text-gray-500">
            <tr>
              <th class="px-6 py-4 font-semibold">
                Evento
              </th>

              <th class="px-6 py-4 font-semibold">
                Data/local
              </th>

              <th class="px-6 py-4 font-semibold">
                Estado
              </th>

              <th class="px-6 py-4 font-semibold">
                Inscrições
              </th>

              <th class="px-6 py-4 font-semibold">
                Publicação
              </th>

              <th class="px-6 py-4 font-semibold">
                Ações
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200 text-sm">
            <tr
              v-for="event in filteredEvents"
              :key="event.id"
              class="align-top"
            >
              <td class="px-6 py-5">
                <p class="text-2xl">
                  {{ event.imageEmoji }}
                </p>

                <p class="mt-2 font-bold text-gray-950">
                  {{ event.title }}
                </p>

                <p class="mt-1 max-w-sm text-gray-500">
                  {{ event.description }}
                </p>

                <p class="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                  {{ event.category }}
                </p>
              </td>

              <td class="px-6 py-5">
                <p class="font-semibold text-gray-950">
                  {{ event.eventDate ? formatDate(event.eventDate) : event.dateLabel }}
                </p>

                <p class="mt-1 text-gray-600">
                  {{ event.timeLabel || event.eventTime || 'Hora a anunciar' }}
                </p>

                <p class="mt-1 text-gray-500">
                  {{ event.location }}
                </p>
              </td>

              <td class="px-6 py-5">
                <span
                  class="rounded-full border px-3 py-1 text-xs font-bold"
                  :class="getStatusClass(event.status)"
                >
                  {{ getStatusLabel(event.status) }}
                </span>
              </td>

              <td class="px-6 py-5">
                <p class="font-semibold text-gray-950">
                  {{ event.registeredSeats }} / {{ event.capacity }} lugares
                </p>

                <p class="mt-1 text-gray-500">
                  {{ event.registrationsCount }} inscrição(ões)
                </p>

                <p class="mt-1 text-gray-500">
                  {{ event.pendingPayments }} pagamento(s) pendente(s)
                </p>
              </td>

              <td class="px-6 py-5">
                <span
                  v-if="event.isPublished"
                  class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                >
                  Publicado
                </span>

                <span
                  v-else
                  class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-600"
                >
                  Não publicado
                </span>
              </td>

              <td class="px-6 py-5">
                <div class="flex flex-wrap gap-2">
                  <NuxtLink
                    :to="`/admin/eventos/${event.slug}`"
                    class="rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                  >
                    Ver
                  </NuxtLink>

                  <NuxtLink
                    :to="`/admin/eventos/${event.slug}/editar`"
                    class="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Editar
                  </NuxtLink>

                  <button
                    type="button"
                    class="rounded-xl border border-sky-300 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isSubmitting"
                    @click="handleTogglePublication(event)"
                  >
                    {{ event.isPublished ? 'Despublicar' : 'Publicar' }}
                  </button>

                  <button
                    v-if="event.status !== 'open'"
                    type="button"
                    class="rounded-xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isSubmitting"
                    @click="handleUpdateStatus(event.id, 'open')"
                  >
                    Abrir
                  </button>

                  <button
                    v-if="event.status !== 'closed'"
                    type="button"
                    class="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isSubmitting"
                    @click="handleUpdateStatus(event.id, 'closed')"
                  >
                    Fechar
                  </button>

                  <button
                    type="button"
                    class="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isSubmitting"
                    @click="handleDeleteEvent(event)"
                  >
                    Apagar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <SharedEmptyState
        v-else
        class="m-6"
        icon="📅"
        title="Nenhum evento encontrado"
        description="Ainda não existem eventos reais no Supabase ou os filtros selecionados não têm resultados."
        action-label="Criar evento"
        action-to="/admin/eventos/novo"
      />
    </div>
  </UContainer>
</template>