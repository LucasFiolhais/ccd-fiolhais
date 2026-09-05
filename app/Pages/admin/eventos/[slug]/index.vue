<script setup lang="ts">
import {
  useSupabaseAdminEvents,
  type AdminEvent,
  type AdminEventStatus
} from '~/composables/useSupabaseAdminEvents'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()

const {
  getEventBySlug,
  updateEventStatus,
  updateEventPublication,
  deleteEvent
} = useSupabaseAdminEvents()

const event = ref<AdminEvent | null>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

const eventSlug = computed(() => {
  return String(route.params.slug)
})

useHead(() => {
  return {
    title: event.value ? event.value.title : 'Evento'
  }
})

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

const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value))
}

const displayDate = computed(() => {
  if (!event.value) {
    return ''
  }

  return event.value.eventDate
    ? formatDate(event.value.eventDate)
    : event.value.dateLabel
})

const displayTime = computed(() => {
  if (!event.value) {
    return ''
  }

  return event.value.timeLabel || event.value.eventTime || 'Hora a anunciar'
})

const availableSeats = computed(() => {
  if (!event.value) {
    return 0
  }

  return event.value.capacity - event.value.registeredSeats
})

const loadEvent = async () => {
  isLoading.value = true
  submitError.value = ''
  successMessage.value = ''

  const result = await getEventBySlug(eventSlug.value)

  isLoading.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível carregar o evento.'
    return
  }

  event.value = result.event
}

const handleReload = async () => {
  await loadEvent()
}

const handleUpdateStatus = async (status: AdminEventStatus) => {
  if (!event.value) {
    return
  }

  submitError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  const result = await updateEventStatus(event.value.id, status)

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível atualizar o estado do evento.'
    return
  }

  successMessage.value = 'Estado do evento atualizado com sucesso.'
  await loadEvent()
}

const handleTogglePublication = async () => {
  if (!event.value) {
    return
  }

  submitError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  const result = await updateEventPublication(
    event.value.id,
    !event.value.isPublished
  )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível atualizar a publicação do evento.'
    return
  }

  successMessage.value = event.value.isPublished
    ? 'Evento removido do site público.'
    : 'Evento publicado no site público.'

  await loadEvent()
}

const handleDeleteEvent = async () => {
  if (!event.value) {
    return
  }

  const confirmed = confirm(`Tens a certeza que queres apagar o evento "${event.value.title}"?`)

  if (!confirmed) {
    return
  }

  submitError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  const result = await deleteEvent(event.value.id)

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível apagar o evento.'
    return
  }

  await navigateTo('/admin/eventos')
}

onMounted(async () => {
  await loadEvent()
})
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <NuxtLink
        to="/admin/eventos"
        class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
      >
        ← Voltar aos eventos
      </NuxtLink>
    </div>

    <div
      v-if="isLoading"
      class="rounded-3xl border border-amber-200 bg-white p-8 text-center text-gray-600 shadow-sm"
    >
      A carregar evento...
    </div>

    <div
      v-else-if="submitError && !event"
      class="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
    >
      <p class="font-bold">
        Erro
      </p>

      <p class="mt-2">
        {{ submitError }}
      </p>
    </div>

    <div
      v-else-if="event"
      class="space-y-8"
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
            Evento
          </p>

          <h1 class="mt-2 text-3xl font-bold text-gray-950">
            {{ event.title }}
          </h1>

          <p class="mt-3 max-w-3xl leading-7 text-gray-600">
            {{ event.description }}
          </p>

          <div class="mt-4 flex flex-wrap gap-3">
            <span
              class="rounded-full border px-3 py-1 text-xs font-bold"
              :class="getStatusClass(event.status)"
            >
              {{ getStatusLabel(event.status) }}
            </span>

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
          </div>
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
            :to="`/admin/eventos/${event.slug}/editar`"
            class="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Editar
          </NuxtLink>

          <button
            type="button"
            class="rounded-xl border border-sky-300 px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting"
            @click="handleTogglePublication"
          >
            {{ event.isPublished ? 'Despublicar' : 'Publicar' }}
          </button>

          <button
            type="button"
            class="rounded-xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting"
            @click="handleDeleteEvent"
          >
            Apagar
          </button>
        </div>
      </div>

      <div
        v-if="submitError"
        class="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
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
        class="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
      >
        <p class="font-bold">
          Ação concluída
        </p>

        <p class="mt-2">
          {{ successMessage }}
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Lugares inscritos"
          :value="event.registeredSeats"
          :description="`${event.capacity} lugares disponíveis`"
        />

        <AdminStatCard
          label="Lugares livres"
          :value="availableSeats"
          description="Capacidade restante"
        />

        <AdminStatCard
          label="Inscrições"
          :value="event.registrationsCount"
          description="Total de inscrições"
        />

        <AdminStatCard
          label="Pagamentos pendentes"
          :value="event.pendingPayments"
          description="Ainda por confirmar"
        />
      </div>

      <div class="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="rounded-3xl border border-amber-200 bg-white shadow-sm">
          <div class="border-b border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-950">
              Informação do evento
            </h2>
          </div>

          <div class="space-y-6 p-6">
            <div class="flex h-40 items-center justify-center rounded-2xl bg-gray-50 text-7xl">
              {{ event.imageEmoji }}
            </div>

            <div>
              <p class="text-sm font-semibold text-gray-500">
                Descrição completa
              </p>

              <p class="mt-2 whitespace-pre-line leading-8 text-gray-700">
                {{ event.longDescription }}
              </p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm font-semibold text-gray-500">
                  Categoria
                </p>

                <p class="mt-1 text-gray-950">
                  {{ event.category }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm font-semibold text-gray-500">
                  Local
                </p>

                <p class="mt-1 text-gray-950">
                  {{ event.location }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm font-semibold text-gray-500">
                  Data
                </p>

                <p class="mt-1 text-gray-950">
                  {{ displayDate }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm font-semibold text-gray-500">
                  Hora
                </p>

                <p class="mt-1 text-gray-950">
                  {{ displayTime }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-8">
          <div class="rounded-3xl border border-amber-200 bg-white shadow-sm">
            <div class="border-b border-gray-200 p-6">
              <h2 class="text-2xl font-bold text-gray-950">
                Preços e lotação
              </h2>
            </div>

            <div class="space-y-4 p-6">
              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm font-semibold text-gray-500">
                  Preço para sócios
                </p>

                <p class="mt-1 text-gray-950">
                  {{ event.priceMember }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm font-semibold text-gray-500">
                  Preço para não sócios
                </p>

                <p class="mt-1 text-gray-950">
                  {{ event.priceNonMember }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm font-semibold text-gray-500">
                  Lotação
                </p>

                <p class="mt-1 text-gray-950">
                  {{ event.capacity }} lugares
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white shadow-sm">
            <div class="border-b border-gray-200 p-6">
              <h2 class="text-2xl font-bold text-gray-950">
                Estado do evento
              </h2>
            </div>

            <div class="space-y-3 p-6">
              <button
                v-if="event.status !== 'open'"
                type="button"
                class="w-full rounded-xl border border-emerald-300 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSubmitting"
                @click="handleUpdateStatus('open')"
              >
                Abrir inscrições
              </button>

              <button
                v-if="event.status !== 'soon'"
                type="button"
                class="w-full rounded-xl border border-amber-300 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSubmitting"
                @click="handleUpdateStatus('soon')"
              >
                Marcar como brevemente
              </button>

              <button
                v-if="event.status !== 'sold_out'"
                type="button"
                class="w-full rounded-xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSubmitting"
                @click="handleUpdateStatus('sold_out')"
              >
                Marcar como esgotado
              </button>

              <button
                v-if="event.status !== 'closed'"
                type="button"
                class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSubmitting"
                @click="handleUpdateStatus('closed')"
              >
                Fechar evento
              </button>
            </div>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <h2 class="text-2xl font-bold text-gray-950">
              Registo
            </h2>

            <p class="mt-4 text-sm text-gray-600">
              Criado em {{ formatDateTime(event.createdAt) }}
            </p>

            <p class="mt-2 text-sm text-gray-600">
              Atualizado em {{ formatDateTime(event.updatedAt) }}
            </p>

            <p class="mt-2 break-all text-sm text-gray-500">
              Slug: {{ event.slug }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <SharedEmptyState
      v-else
      icon="📅"
      title="Evento não encontrado"
      description="O evento indicado não existe na base de dados Supabase."
      action-label="Voltar aos eventos"
      action-to="/admin/eventos"
    />
  </UContainer>
</template>