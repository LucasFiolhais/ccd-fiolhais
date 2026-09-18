<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'
import { useSupabaseEvents } from '~/composables/useSupabaseEvents'
import { useSupabaseEventRegistrations } from '~/composables/useSupabaseEventRegistrations'

const route = useRoute()

const { getEventBySlug } = useEvents()
const { getPublishedEventBySlug } = useSupabaseEvents()
const { createEventRegistration } = useSupabaseEventRegistrations()

const slug = computed(() => {
  return String(route.params.slug)
})

const {
  data: supabaseEvent,
  pending
} = await useAsyncData(`public-event-${slug.value}`, () => {
  return getPublishedEventBySlug(slug.value)
})

const mockEvent = computed(() => {
  return getEventBySlug(slug.value)
})

const event = computed(() => {
  return supabaseEvent.value || mockEvent.value || null
})

const isUsingSupabase = computed(() => {
  return Boolean(supabaseEvent.value)
})

const canRegister = computed(() => {
  return Boolean(
    supabaseEvent.value &&
    supabaseEvent.value.status === 'open'
  )
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

const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

useHead(() => {
  return {
    title: event.value?.title || 'Evento'
  }
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
    errors.fullName = 'O nome é obrigatório.'
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
    errors.seats = 'Nesta fase podes reservar no máximo 10 lugares por inscrição.'
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

const handleRegistration = async () => {
  if (!supabaseEvent.value) {
    submitError.value = 'Este evento ainda não está disponível para inscrições online.'
    return
  }

  if (supabaseEvent.value.status !== 'open') {
    submitError.value = 'As inscrições para este evento não estão abertas.'
    return
  }

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  successMessage.value = ''

  const result = await createEventRegistration({
    eventId: String(supabaseEvent.value.id),
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    memberNumber: form.memberNumber.trim() || undefined,
    seats: form.seats,
    notes: form.notes.trim() || undefined
  })

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível concluir a inscrição.'
    return
  }

  successMessage.value =
    'A tua inscrição foi recebida com sucesso. O CCD Fiolhais irá validar a inscrição e o pagamento.'

  resetForm()
}
</script>

<template>
  <div>
    <section class="bg-gray-50 py-16">
      <UContainer>
        <NuxtLink
          to="/agenda"
          class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
        >
          ← Voltar à agenda
        </NuxtLink>

        <div
          v-if="pending"
          class="mt-8 rounded-2xl border border-amber-200 bg-white p-8 text-gray-700 shadow-sm"
        >
          A carregar evento...
        </div>

        <div
          v-else-if="event"
          class="mt-8 space-y-10"
        >
          <div class="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
                {{ event.category }}
              </p>

              <h1 class="mt-3 text-4xl font-bold text-gray-950">
                {{ event.title }}
              </h1>

              <p class="mt-4 text-lg leading-8 text-gray-700">
                {{ event.description }}
              </p>

              <div
                v-if="isUsingSupabase"
                class="mt-6 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
              >
                Evento oficial
              </div>

              <div
                v-else
                class="mt-6 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800"
              >
                Evento de demonstração
              </div>
            </div>

            <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
              <div class="flex h-40 items-center justify-center rounded-2xl bg-gray-50 text-6xl">
                {{ event.imageEmoji }}
              </div>

              <div class="mt-6 space-y-4">
                <div class="rounded-2xl bg-gray-50 p-4">
                  <p class="text-sm text-gray-500">
                    Data
                  </p>

                  <p class="mt-1 font-semibold text-gray-950">
                    {{ event.date }}
                  </p>
                </div>

                <div class="rounded-2xl bg-gray-50 p-4">
                  <p class="text-sm text-gray-500">
                    Hora
                  </p>

                  <p class="mt-1 font-semibold text-gray-950">
                    {{ event.time }}
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

                <div class="grid gap-4 sm:grid-cols-2">
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
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white p-8 leading-8 text-gray-700 shadow-sm">
            <h2 class="text-2xl font-bold text-gray-950">
              Sobre o evento
            </h2>

            <p class="mt-4 whitespace-pre-line">
              {{ event.longDescription }}
            </p>
          </div>

          <div
            v-if="canRegister"
            class="rounded-3xl border border-amber-200 bg-white shadow-sm"
          >
            <div class="border-b border-gray-200 p-6">
              <h2 class="text-2xl font-bold text-gray-950">
                Inscrição no evento
              </h2>

              <p class="mt-2 text-gray-600">
                Preenche os dados abaixo para enviares a tua inscrição.
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
                  placeholder="O teu nome"
                  class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
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
                    placeholder="email@exemplo.com"
                    class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
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
                    placeholder="912 345 678"
                    class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
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
                    Número de lugares
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
                  placeholder="Ex: necessidades alimentares, informação adicional..."
                  class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              <button
                type="submit"
                class="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'A enviar inscrição...' : 'Enviar inscrição' }}
              </button>
            </form>
          </div>

          <div
            v-else-if="isUsingSupabase"
            class="rounded-3xl border border-gray-200 bg-gray-50 p-6"
          >
            <h2 class="text-xl font-bold text-gray-950">
              Inscrições indisponíveis
            </h2>

            <p class="mt-2 text-gray-600">
              As inscrições para este evento não estão abertas neste momento.
            </p>
          </div>

          <div
            v-else
            class="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950"
          >
            Este evento é apenas de demonstração e não aceita inscrições reais.
          </div>
        </div>

        <SharedEmptyState
          v-else
          class="mt-8"
          icon="📅"
          title="Evento não encontrado"
          description="O evento que procuras não existe, ainda não está publicado ou foi removido."
          action-label="Voltar à agenda"
          action-to="/agenda"
        />
      </UContainer>
    </section>
  </div>
</template>