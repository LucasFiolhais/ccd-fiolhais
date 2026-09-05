<script setup lang="ts">
import {
  useSupabaseAdminEvents,
  type AdminEventStatus
} from '~/composables/useSupabaseAdminEvents'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Novo Evento'
})

const { createEvent } = useSupabaseAdminEvents()

const form = reactive({
  title: '',
  description: '',
  longDescription: '',
  dateLabel: 'Data a anunciar',
  eventDate: '',
  timeLabel: '',
  eventTime: '',
  location: 'Fiolhais',
  priceMember: '',
  priceNonMember: '',
  capacity: 50,
  status: 'draft' as AdminEventStatus,
  category: '',
  imageEmoji: '🎉',
  isPublished: false
})

const errors = reactive({
  title: '',
  description: '',
  longDescription: '',
  dateLabel: '',
  location: '',
  priceMember: '',
  priceNonMember: '',
  capacity: '',
  category: '',
  imageEmoji: ''
})

const isSubmitting = ref(false)
const submitError = ref('')

const statusOptions: Array<{
  label: string
  value: AdminEventStatus
}> = [
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

const clearErrors = () => {
  errors.title = ''
  errors.description = ''
  errors.longDescription = ''
  errors.dateLabel = ''
  errors.location = ''
  errors.priceMember = ''
  errors.priceNonMember = ''
  errors.capacity = ''
  errors.category = ''
  errors.imageEmoji = ''
  submitError.value = ''
}

const validateForm = () => {
  clearErrors()

  if (!form.title.trim()) {
    errors.title = 'O título é obrigatório.'
  }

  if (!form.description.trim()) {
    errors.description = 'A descrição curta é obrigatória.'
  }

  if (!form.longDescription.trim()) {
    errors.longDescription = 'A descrição completa é obrigatória.'
  }

  if (!form.dateLabel.trim()) {
    errors.dateLabel = 'A data visível é obrigatória.'
  }

  if (!form.location.trim()) {
    errors.location = 'O local é obrigatório.'
  }

  if (!form.priceMember.trim()) {
    errors.priceMember = 'O preço para sócios é obrigatório.'
  }

  if (!form.priceNonMember.trim()) {
    errors.priceNonMember = 'O preço para não sócios é obrigatório.'
  }

  if (!form.capacity || form.capacity < 1) {
    errors.capacity = 'A lotação deve ser superior a zero.'
  }

  if (!form.category.trim()) {
    errors.category = 'A categoria é obrigatória.'
  }

  if (!form.imageEmoji.trim()) {
    errors.imageEmoji = 'O emoji é obrigatório.'
  }

  return (
    !errors.title &&
    !errors.description &&
    !errors.longDescription &&
    !errors.dateLabel &&
    !errors.location &&
    !errors.priceMember &&
    !errors.priceNonMember &&
    !errors.capacity &&
    !errors.category &&
    !errors.imageEmoji
  )
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  const result = await createEvent({
    title: form.title.trim(),
    description: form.description.trim(),
    longDescription: form.longDescription.trim(),
    dateLabel: form.dateLabel.trim(),
    eventDate: form.eventDate || undefined,
    timeLabel: form.timeLabel.trim() || undefined,
    eventTime: form.eventTime || undefined,
    location: form.location.trim(),
    priceMember: form.priceMember.trim(),
    priceNonMember: form.priceNonMember.trim(),
    capacity: form.capacity,
    status: form.status,
    category: form.category.trim(),
    imageEmoji: form.imageEmoji.trim(),
    isPublished: form.isPublished
  })

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível criar o evento.'
    return
  }

  await navigateTo(`/admin/eventos/${result.slug}`)
}
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

    <div class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
        Administração
      </p>

      <h1 class="mt-2 text-3xl font-bold text-gray-950">
        Criar novo evento
      </h1>

      <p class="mt-2 text-gray-600">
        Cria um evento real na base de dados Supabase.
      </p>
    </div>

    <div
      v-if="submitError"
      class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
    >
      <p class="font-bold">
        Erro
      </p>

      <p class="mt-2">
        {{ submitError }}
      </p>
    </div>

    <form
      class="rounded-3xl border border-amber-200 bg-white shadow-sm"
      @submit.prevent="handleSubmit"
    >
      <div class="border-b border-gray-200 p-6">
        <h2 class="text-2xl font-bold text-gray-950">
          Dados do evento
        </h2>

        <p class="mt-2 text-gray-600">
          O evento só aparece no site público se estiver marcado como publicado.
        </p>
      </div>

      <div class="space-y-6 p-6">
        <div class="grid gap-5 md:grid-cols-[120px_1fr]">
          <div>
            <label class="text-sm font-semibold text-gray-800">
              Emoji
            </label>

            <input
              v-model="form.imageEmoji"
              type="text"
              class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-center text-2xl text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              :class="errors.imageEmoji ? 'border-red-400' : 'border-gray-300'"
            >

            <p
              v-if="errors.imageEmoji"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.imageEmoji }}
            </p>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-800">
              Título
            </label>

            <input
              v-model="form.title"
              type="text"
              placeholder="Ex: Almoço Comunitário"
              class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              :class="errors.title ? 'border-red-400' : 'border-gray-300'"
            >

            <p
              v-if="errors.title"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.title }}
            </p>
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <label class="text-sm font-semibold text-gray-800">
              Categoria
            </label>

            <input
              v-model="form.category"
              type="text"
              placeholder="Ex: Convívio"
              class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              :class="errors.category ? 'border-red-400' : 'border-gray-300'"
            >

            <p
              v-if="errors.category"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.category }}
            </p>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-800">
              Local
            </label>

            <input
              v-model="form.location"
              type="text"
              placeholder="Ex: Sede do CCD"
              class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              :class="errors.location ? 'border-red-400' : 'border-gray-300'"
            >

            <p
              v-if="errors.location"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.location }}
            </p>
          </div>
        </div>

        <div>
          <label class="text-sm font-semibold text-gray-800">
            Descrição curta
          </label>

          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Resumo que aparece na listagem pública."
            class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            :class="errors.description ? 'border-red-400' : 'border-gray-300'"
          />

          <p
            v-if="errors.description"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.description }}
          </p>
        </div>

        <div>
          <label class="text-sm font-semibold text-gray-800">
            Descrição completa
          </label>

          <textarea
            v-model="form.longDescription"
            rows="6"
            placeholder="Texto completo da página individual do evento."
            class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            :class="errors.longDescription ? 'border-red-400' : 'border-gray-300'"
          />

          <p
            v-if="errors.longDescription"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.longDescription }}
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label class="text-sm font-semibold text-gray-800">
              Data visível
            </label>

            <input
              v-model="form.dateLabel"
              type="text"
              placeholder="Ex: Data a anunciar"
              class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              :class="errors.dateLabel ? 'border-red-400' : 'border-gray-300'"
            >

            <p
              v-if="errors.dateLabel"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.dateLabel }}
            </p>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-800">
              Data real
            </label>

            <input
              v-model="form.eventDate"
              type="date"
              class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-800">
              Hora visível
            </label>

            <input
              v-model="form.timeLabel"
              type="text"
              placeholder="Ex: 12:30"
              class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-800">
              Hora real
            </label>

            <input
              v-model="form.eventTime"
              type="time"
              class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-3">
          <div>
            <label class="text-sm font-semibold text-gray-800">
              Preço sócio
            </label>

            <input
              v-model="form.priceMember"
              type="text"
              placeholder="Ex: 12€"
              class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              :class="errors.priceMember ? 'border-red-400' : 'border-gray-300'"
            >

            <p
              v-if="errors.priceMember"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.priceMember }}
            </p>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-800">
              Preço não sócio
            </label>

            <input
              v-model="form.priceNonMember"
              type="text"
              placeholder="Ex: 15€"
              class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              :class="errors.priceNonMember ? 'border-red-400' : 'border-gray-300'"
            >

            <p
              v-if="errors.priceNonMember"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.priceNonMember }}
            </p>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-800">
              Lotação
            </label>

            <input
              v-model.number="form.capacity"
              type="number"
              min="1"
              class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              :class="errors.capacity ? 'border-red-400' : 'border-gray-300'"
            >

            <p
              v-if="errors.capacity"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.capacity }}
            </p>
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <label class="text-sm font-semibold text-gray-800">
              Estado
            </label>

            <select
              v-model="form.status"
              class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >
              <option
                v-for="status in statusOptions"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <label class="flex gap-3 text-sm text-gray-700">
              <input
                v-model="form.isPublished"
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600"
              >

              <span>
                Publicar no site público
              </span>
            </label>

            <p class="mt-2 text-sm text-gray-500">
              Se não estiver marcado, o evento fica guardado apenas no backoffice.
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3 border-t border-gray-200 p-6 sm:flex-row sm:justify-end">
        <NuxtLink
          to="/admin/eventos"
          class="rounded-xl border border-gray-300 px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Cancelar
        </NuxtLink>

        <button
          type="submit"
          class="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'A criar...' : 'Criar evento' }}
        </button>
      </div>
    </form>
  </UContainer>
</template>