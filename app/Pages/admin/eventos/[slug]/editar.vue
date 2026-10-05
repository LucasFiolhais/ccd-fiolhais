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
const router = useRouter()

const {
  getEventBySlug,
  updateEvent
} = useSupabaseAdminEvents()

const event = ref<AdminEvent | null>(null)

const isLoading = ref(true)
const isSubmitting = ref(false)

const loadError = ref('')
const submitError = ref('')

const eventSlug = computed(() => {
  return String(route.params.slug)
})

const form = reactive({
  title: '',
  description: '',
  longDescription: '',
  eventDate: '',
  eventTime: '',
  location: '',
  priceMember: '',
  priceNonMember: '',
  capacity: 1,
  status: 'soon' as AdminEventStatus,
  imageEmoji: '🎉',
  category: '',
  isPublished: true
})

const errors = reactive({
  title: '',
  description: '',
  longDescription: '',
  eventDate: '',
  eventTime: '',
  location: '',
  priceMember: '',
  priceNonMember: '',
  capacity: '',
  category: ''
})

const statusOptions = [
  {
    label: 'Rascunho',
    value: 'draft'
  },
  {
    label: 'Aberto',
    value: 'open'
  },
  {
    label: 'Em breve',
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

const categoryOptions = [
  'Convívio',
  'Tradição',
  'Cultura',
  'Desporto',
  'Assembleia',
  'Outro'
]

const emojiOptions = [
  '🎉',
  '🍽️',
  '🌰',
  '🎤',
  '⚽',
  '🏃',
  '📣',
  '🎭'
]

useHead(() => {
  return {
    title: event.value
      ? `Editar ${event.value.title}`
      : 'Editar Evento'
  }
})

const formatDateLabel = (value: string) => {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(
    new Date(`${value}T00:00:00`)
  )
}

const formatTimeLabel = (value: string) => {
  if (!value) {
    return ''
  }

  return value.slice(0, 5)
}

const clearErrors = () => {
  errors.title = ''
  errors.description = ''
  errors.longDescription = ''
  errors.eventDate = ''
  errors.eventTime = ''
  errors.location = ''
  errors.priceMember = ''
  errors.priceNonMember = ''
  errors.capacity = ''
  errors.category = ''

  submitError.value = ''
}

const validateForm = () => {
  clearErrors()

  if (!form.title.trim()) {
    errors.title =
      'O título é obrigatório.'
  }

  if (!form.description.trim()) {
    errors.description =
      'A descrição curta é obrigatória.'
  }

  if (!form.longDescription.trim()) {
    errors.longDescription =
      'A descrição completa é obrigatória.'
  }

  if (!form.eventDate) {
    errors.eventDate =
      'A data é obrigatória.'
  }

  if (!form.eventTime) {
    errors.eventTime =
      'A hora é obrigatória.'
  }

  if (!form.location.trim()) {
    errors.location =
      'O local é obrigatório.'
  }

  if (!form.priceMember.trim()) {
    errors.priceMember =
      'O preço para sócios é obrigatório.'
  }

  if (!form.priceNonMember.trim()) {
    errors.priceNonMember =
      'O preço para não sócios é obrigatório.'
  }

  if (
    !form.capacity ||
    form.capacity < 1
  ) {
    errors.capacity =
      'A capacidade tem de ser superior a zero.'
  }

  if (!form.category.trim()) {
    errors.category =
      'A categoria é obrigatória.'
  }

  return (
    !errors.title &&
    !errors.description &&
    !errors.longDescription &&
    !errors.eventDate &&
    !errors.eventTime &&
    !errors.location &&
    !errors.priceMember &&
    !errors.priceNonMember &&
    !errors.capacity &&
    !errors.category
  )
}

const fillForm = (
  loadedEvent: AdminEvent
) => {
  form.title =
    loadedEvent.title

  form.description =
    loadedEvent.description

  form.longDescription =
    loadedEvent.longDescription

  form.eventDate =
    loadedEvent.eventDate || ''

  form.eventTime =
    loadedEvent.eventTime
      ? loadedEvent.eventTime.slice(0, 5)
      : ''

  form.location =
    loadedEvent.location

  form.priceMember =
    loadedEvent.priceMember

  form.priceNonMember =
    loadedEvent.priceNonMember

  form.capacity =
    loadedEvent.capacity

  form.status =
    loadedEvent.status

  form.imageEmoji =
    loadedEvent.imageEmoji

  form.category =
    loadedEvent.category

  form.isPublished =
    loadedEvent.isPublished
}

const loadEvent = async () => {
  isLoading.value = true
  loadError.value = ''

  const result =
    await getEventBySlug(
      eventSlug.value
    )

  isLoading.value = false

  if (!result.success) {
    loadError.value =
      result.error ||
      'Não foi possível carregar o evento.'

    return
  }

  if (!result.event) {
    event.value = null
    return
  }

  event.value =
    result.event

  fillForm(
    result.event
  )
}

const handleSubmit = async () => {
  if (
    !event.value ||
    !validateForm()
  ) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  const result =
    await updateEvent(
      event.value.id,
      {
        title:
          form.title.trim(),

        description:
          form.description.trim(),

        longDescription:
          form.longDescription.trim(),

        dateLabel:
          formatDateLabel(
            form.eventDate
          ),

        eventDate:
          form.eventDate,

        timeLabel:
          formatTimeLabel(
            form.eventTime
          ),

        eventTime:
          form.eventTime,

        location:
          form.location.trim(),

        priceMember:
          form.priceMember.trim(),

        priceNonMember:
          form.priceNonMember.trim(),

        capacity:
          form.capacity,

        status:
          form.status,

        category:
          form.category,

        imageEmoji:
          form.imageEmoji,

        isPublished:
          form.isPublished
      }
    )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value =
      result.error ||
      'Não foi possível guardar as alterações.'

    return
  }

  await router.push(
    `/admin/eventos/${event.value.slug}`
  )
}

onMounted(async () => {
  await loadEvent()
})
</script>

<template>
  <UContainer class="py-10">
    <NuxtLink
      :to="event ? `/admin/eventos/${event.slug}` : '/admin/eventos'"
      class="mb-6 inline-block text-sm font-semibold text-amber-700 hover:text-amber-600"
    >
      ← Voltar ao evento
    </NuxtLink>

    <div
      v-if="isLoading"
      class="rounded-3xl border border-amber-200 bg-white p-10 text-center text-gray-600 shadow-sm"
    >
      A carregar evento...
    </div>

    <div
      v-else-if="loadError"
      class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900"
    >
      <p class="font-bold">
        Não foi possível carregar o evento
      </p>

      <p class="mt-2">
        {{ loadError }}
      </p>
    </div>

    <form
      v-else-if="event"
      class="space-y-8"
      @submit.prevent="handleSubmit"
    >
      <div>
        <p class="text-sm font-bold uppercase tracking-wide text-amber-600">
          Administração
        </p>

        <h1 class="mt-2 text-3xl font-black text-gray-950">
          Editar evento
        </h1>

        <p class="mt-2 text-gray-600">
          {{ event.title }}
        </p>
      </div>

      <div
        v-if="submitError"
        class="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
      >
        {{ submitError }}
      </div>

      <section class="rounded-3xl border border-amber-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-950">
            Informação do evento
          </h2>
        </div>

        <div class="space-y-5 p-6">
          <UFormField
            label="Título"
            :error="errors.title"
          >
            <UInput
              v-model="form.title"
              size="lg"
            />
          </UFormField>

          <UFormField
            label="Descrição curta"
            :error="errors.description"
          >
            <UTextarea
              v-model="form.description"
              :rows="3"
            />
          </UFormField>

          <UFormField
            label="Descrição completa"
            :error="errors.longDescription"
          >
            <UTextarea
              v-model="form.longDescription"
              :rows="7"
            />
          </UFormField>

          <div class="grid gap-5 md:grid-cols-2">
            <UFormField
              label="Data"
              :error="errors.eventDate"
            >
              <UInput
                v-model="form.eventDate"
                type="date"
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Hora"
              :error="errors.eventTime"
            >
              <UInput
                v-model="form.eventTime"
                type="time"
                size="lg"
              />
            </UFormField>
          </div>

          <UFormField
            label="Local"
            :error="errors.location"
          >
            <UInput
              v-model="form.location"
              size="lg"
            />
          </UFormField>

          <div class="grid gap-5 md:grid-cols-2">
            <UFormField
              label="Preço para sócios"
              :error="errors.priceMember"
            >
              <UInput
                v-model="form.priceMember"
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Preço para não sócios"
              :error="errors.priceNonMember"
            >
              <UInput
                v-model="form.priceNonMember"
                size="lg"
              />
            </UFormField>
          </div>

          <UFormField
            label="Capacidade"
            :error="errors.capacity"
          >
            <UInput
              v-model.number="form.capacity"
              type="number"
              min="1"
              size="lg"
            />
          </UFormField>
        </div>
      </section>

      <section class="rounded-3xl border border-amber-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-950">
            Estado e publicação
          </h2>
        </div>

        <div class="space-y-6 p-6">
          <UFormField label="Estado">
            <select
              v-model="form.status"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950"
            >
              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </UFormField>

          <UFormField
            label="Categoria"
            :error="errors.category"
          >
            <select
              v-model="form.category"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950"
            >
              <option value="">
                Selecionar categoria
              </option>

              <option
                v-for="category in categoryOptions"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </UFormField>

          <div>
            <p class="text-sm font-semibold text-gray-800">
              Ícone do evento
            </p>

            <div class="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
              <button
                v-for="emoji in emojiOptions"
                :key="emoji"
                type="button"
                class="rounded-xl border p-3 text-2xl transition"
                :class="
                  form.imageEmoji === emoji
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:bg-gray-50'
                "
                @click="form.imageEmoji = emoji"
              >
                {{ emoji }}
              </button>
            </div>
          </div>

          <label class="flex items-start gap-3 rounded-2xl border border-gray-200 p-4">
            <input
              v-model="form.isPublished"
              type="checkbox"
              class="mt-1 h-4 w-4"
            >

            <span>
              <strong class="block text-gray-950">
                Evento publicado
              </strong>

              <span class="mt-1 block text-sm text-gray-600">
                O evento fica visível na agenda pública.
              </span>
            </span>
          </label>
        </div>
      </section>

      <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <NuxtLink
          :to="`/admin/eventos/${event.slug}`"
          class="rounded-xl border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700"
        >
          Cancelar
        </NuxtLink>

        <button
          type="submit"
          class="rounded-xl bg-amber-500 px-6 py-3 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
        >
          {{
            isSubmitting
              ? 'A guardar...'
              : 'Guardar alterações'
          }}
        </button>
      </div>
    </form>

    <SharedEmptyState
      v-else
      icon="📅"
      title="Evento não encontrado"
      description="Não foi possível encontrar o evento indicado."
      action-label="Voltar aos eventos"
      action-to="/admin/eventos"
    />
  </UContainer>
</template>