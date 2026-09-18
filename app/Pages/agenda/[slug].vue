<script setup lang="ts">
import {
  useSupabasePublicEvents,
  type PublicEvent
} from '~/composables/useSupabasePublicEvents'
import { useSupabaseEventRegistrations } from '~/composables/useSupabaseEventRegistrations'

const route = useRoute()

const {
  getPublishedEventBySlug
} = useSupabasePublicEvents()

const {
  createEventRegistration
} = useSupabaseEventRegistrations()

const event = ref<PublicEvent | null>(null)

const isLoading = ref(true)
const loadError = ref('')
const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

const eventSlug = computed(() => {
  return String(route.params.slug)
})

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  memberNumber: '',
  seats: 1,
  notes: ''
})

const errors = reactive({
  fullName: '',
  email: '',
  phone: '',
  seats: ''
})

useHead(() => {
  return {
    title: event.value?.title || 'Evento'
  }
})

const canRegister = computed(() => {
  return event.value?.status === 'open'
})

const displayDate = computed(() => {
  if (!event.value) {
    return ''
  }

  if (!event.value.eventDate) {
    return event.value.dateLabel
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(
    new Date(`${event.value.eventDate}T00:00:00`)
  )
})

const displayTime = computed(() => {
  if (!event.value) {
    return ''
  }

  return event.value.timeLabel ||
    event.value.eventTime ||
    'Hora a anunciar'
})

const clearErrors = () => {
  errors.fullName = ''
  errors.email = ''
  errors.phone = ''
  errors.seats = ''

  submitError.value = ''
}

const validateForm = () => {
  clearErrors()

  if (!form.fullName.trim()) {
    errors.fullName = 'O nome completo é obrigatório.'
  }

  if (!form.email.trim()) {
    errors.email = 'O email é obrigatório.'
  } else if (!form.email.includes('@')) {
    errors.email = 'Insere um email válido.'
  }

  if (!form.phone.trim()) {
    errors.phone = 'O telefone é obrigatório.'
  }

  if (!form.seats || form.seats < 1) {
    errors.seats = 'Escolhe pelo menos um lugar.'
  }

  if (form.seats > 10) {
    errors.seats =
      'Podes reservar no máximo 10 lugares por inscrição.'
  }

  return (
    !errors.fullName &&
    !errors.email &&
    !errors.phone &&
    !errors.seats
  )
}

const resetForm = () => {
  form.fullName = ''
  form.email = ''
  form.phone = ''
  form.memberNumber = ''
  form.seats = 1
  form.notes = ''
}

const loadEvent = async () => {
  isLoading.value = true
  loadError.value = ''

  const result = await getPublishedEventBySlug(
    eventSlug.value
  )

  isLoading.value = false

  if (!result.success) {
    loadError.value =
      result.error ||
      'Não foi possível carregar o evento.'

    event.value = null
    return
  }

  event.value = result.event
}

const handleRegistration = async () => {
  if (!event.value) {
    return
  }

  if (event.value.status !== 'open') {
    submitError.value =
      'As inscrições para este evento não estão abertas.'

    return
  }

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  successMessage.value = ''

  const result = await createEventRegistration({
    eventId: event.value.id,
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    memberNumber:
      form.memberNumber.trim() || undefined,
    seats: form.seats,
    notes: form.notes.trim() || undefined
  })

  isSubmitting.value = false

  if (!result.success) {
    submitError.value =
      result.error ||
      'Não foi possível concluir a inscrição.'

    return
  }

  successMessage.value =
    'A tua inscrição foi recebida com sucesso. A administração irá posteriormente validar a inscrição e o pagamento.'

  resetForm()
}

onMounted(async () => {
  await loadEvent()
})
</script>

<template>
  <section class="bg-[#f8f4ea] py-16">
    <UContainer>
      <NuxtLink
        to="/agenda"
        class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
      >
        ← Voltar à agenda
      </NuxtLink>

      <div
        v-if="isLoading"
        class="mt-8 rounded-3xl border border-amber-200 bg-white p-10 text-center text-gray-600 shadow-sm"
      >
        A carregar evento...
      </div>

      <div
        v-else-if="loadError"
        class="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"
      >
        <p class="font-bold">
          Erro
        </p>

        <p class="mt-2">
          {{ loadError }}
        </p>
      </div>

      <div
        v-else-if="event"
        class="mt-8 space-y-8"
      >
        <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <article class="rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
            <p class="text-sm font-bold uppercase tracking-wide text-amber-600">
              {{ event.category }}
            </p>

            <h1 class="mt-3 text-4xl font-black text-gray-950">
              {{ event.title }}
            </h1>

            <p class="mt-5 text-lg leading-8 text-gray-600">
              {{ event.description }}
            </p>

            <div class="mt-8">
              <h2 class="text-2xl font-bold text-gray-950">
                Sobre o evento
              </h2>

              <p class="mt-4 whitespace-pre-line leading-8 text-gray-700">
                {{ event.longDescription }}
              </p>
            </div>
          </article>

          <aside class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <div class="flex h-40 items-center justify-center rounded-2xl bg-gray-50 text-7xl">
              {{ event.imageEmoji }}
            </div>

            <div class="mt-6 space-y-4">
              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm text-gray-500">
                  Data
                </p>

                <p class="mt-1 font-semibold text-gray-950">
                  {{ displayDate }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm text-gray-500">
                  Hora
                </p>

                <p class="mt-1 font-semibold text-gray-950">
                  {{ displayTime }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm text-gray-500">
                  Local
                </p>

                <p class="mt-1 font-semibold text-gray-950">
                  {{ event.location }}
                </p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div class="rounded-2xl bg-gray-50 p-4">
                  <p class="text-sm text-gray-500">
                    Sócios
                  </p>

                  <p class="mt-1 font-semibold text-gray-950">
                    {{ event.priceMember }}
                  </p>
                </div>

                <div class="rounded-2xl bg-gray-50 p-4">
                  <p class="text-sm text-gray-500">
                    Não sócios
                  </p>

                  <p class="mt-1 font-semibold text-gray-950">
                    {{ event.priceNonMember }}
                  </p>
                </div>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm text-gray-500">
                  Lotação
                </p>

                <p class="mt-1 font-semibold text-gray-950">
                  {{ event.capacity }} lugares
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section
          v-if="canRegister"
          class="rounded-3xl border border-amber-200 bg-white shadow-sm"
        >
          <div class="border-b border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-950">
              Inscrição
            </h2>

            <p class="mt-2 text-gray-600">
              Preenche os teus dados para enviares a inscrição.
            </p>
          </div>

          <div
            v-if="successMessage"
            class="m-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
          >
            <p class="font-bold">
              Inscrição recebida
            </p>

            <p class="mt-2">
              {{ successMessage }}
            </p>
          </div>

          <div
            v-if="submitError"
            class="m-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
          >
            <p class="font-bold">
              Erro
            </p>

            <p class="mt-2">
              {{ submitError }}
            </p>
          </div>

          <form
            class="space-y-5 p-6"
            @submit.prevent="handleRegistration"
          >
            <div>
              <label class="text-sm font-semibold text-gray-800">
                Nome completo
              </label>

              <input
                v-model="form.fullName"
                type="text"
                class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                :class="errors.fullName ? 'border-red-400' : 'border-gray-300'"
              >

              <p
                v-if="errors.fullName"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors.fullName }}
              </p>
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <div>
                <label class="text-sm font-semibold text-gray-800">
                  Email
                </label>

                <input
                  v-model="form.email"
                  type="email"
                  class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  :class="errors.email ? 'border-red-400' : 'border-gray-300'"
                >

                <p
                  v-if="errors.email"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ errors.email }}
                </p>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-800">
                  Telefone
                </label>

                <input
                  v-model="form.phone"
                  type="tel"
                  class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  :class="errors.phone ? 'border-red-400' : 'border-gray-300'"
                >

                <p
                  v-if="errors.phone"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ errors.phone }}
                </p>
              </div>
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <div>
                <label class="text-sm font-semibold text-gray-800">
                  Número de sócio
                </label>

                <input
                  v-model="form.memberNumber"
                  type="text"
                  placeholder="Opcional"
                  class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                >
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-800">
                  Lugares
                </label>

                <input
                  v-model.number="form.seats"
                  type="number"
                  min="1"
                  max="10"
                  class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  :class="errors.seats ? 'border-red-400' : 'border-gray-300'"
                >

                <p
                  v-if="errors.seats"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ errors.seats }}
                </p>
              </div>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Observações
              </label>

              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Informação adicional, se necessário."
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <button
              type="submit"
              class="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'A enviar...' : 'Enviar inscrição' }}
            </button>
          </form>
        </section>

        <div
          v-else
          class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 class="text-xl font-bold text-gray-950">
            Inscrições indisponíveis
          </h2>

          <p class="mt-2 text-gray-600">
            As inscrições para este evento não estão abertas neste momento.
          </p>
        </div>
      </div>

      <SharedEmptyState
        v-else
        class="mt-8"
        icon="📅"
        title="Evento não encontrado"
        description="Este evento não existe ou não está publicado."
        action-label="Voltar à agenda"
        action-to="/agenda"
      />
    </UContainer>
  </section>
</template>