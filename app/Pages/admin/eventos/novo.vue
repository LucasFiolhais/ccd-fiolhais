<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'
import type { EventStatus } from '~/types/event'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { createEvent } = useEvents()

const form = reactive({
  title: '',
  description: '',
  longDescription: '',
  date: '',
  time: '',
  location: 'Fiolhais',
  priceMember: '',
  priceNonMember: '',
  capacity: 50,
  status: 'soon' as EventStatus,
  imageEmoji: '🎉',
  category: ''
})

const errors = reactive({
  title: '',
  description: '',
  longDescription: '',
  date: '',
  time: '',
  location: '',
  priceMember: '',
  priceNonMember: '',
  capacity: '',
  category: ''
})

const statusOptions = [
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
  '🏡',
  '📣',
  '🎭'
]

const clearErrors = () => {
  errors.title = ''
  errors.description = ''
  errors.longDescription = ''
  errors.date = ''
  errors.time = ''
  errors.location = ''
  errors.priceMember = ''
  errors.priceNonMember = ''
  errors.capacity = ''
  errors.category = ''
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

  if (!form.date.trim()) {
    errors.date = 'A data é obrigatória.'
  }

  if (!form.time.trim()) {
    errors.time = 'A hora é obrigatória.'
  }

  if (!form.location.trim()) {
    errors.location = 'O local é obrigatório.'
  }

  if (!form.priceMember.trim()) {
    errors.priceMember = 'O preço para sócio é obrigatório.'
  }

  if (!form.priceNonMember.trim()) {
    errors.priceNonMember = 'O preço para não sócio é obrigatório.'
  }

  if (!form.capacity || form.capacity < 1) {
    errors.capacity = 'A capacidade tem de ser superior a 0.'
  }

  if (!form.category.trim()) {
    errors.category = 'A categoria é obrigatória.'
  }

  return (
    !errors.title &&
    !errors.description &&
    !errors.longDescription &&
    !errors.date &&
    !errors.time &&
    !errors.location &&
    !errors.priceMember &&
    !errors.priceNonMember &&
    !errors.capacity &&
    !errors.category
  )
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  const newEvent = createEvent({
    title: form.title,
    description: form.description,
    longDescription: form.longDescription,
    date: form.date,
    time: form.time,
    location: form.location,
    priceMember: form.priceMember,
    priceNonMember: form.priceNonMember,
    capacity: form.capacity,
    status: form.status,
    imageEmoji: form.imageEmoji,
    category: form.category
  })

  await router.push(`/admin/eventos/${newEvent.slug}`)
}
</script>

<template>
  <UContainer class="py-10">
    <UButton
      to="/admin/eventos"
      variant="link"
      class="mb-6 px-0"
    >
      ← Voltar aos eventos
    </UButton>

    <div class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">
        Novo evento
      </p>

      <h1 class="mt-2 text-3xl font-bold text-gray-950">
        Criar evento
      </h1>

      <p class="mt-2 text-gray-600">
        Preenche os dados principais do evento. Mais tarde este formulário será ligado ao Supabase.
      </p>
    </div>

    <form
      class="grid gap-8 lg:grid-cols-[1fr_360px]"
      @submit.prevent="handleSubmit"
    >
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Informação principal
            </h2>
          </template>

          <div class="space-y-5">
            <UFormField
              label="Título do evento"
              :error="errors.title"
            >
              <UInput
                v-model="form.title"
                placeholder="Ex: Almoço de Natal"
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Descrição curta"
              :error="errors.description"
            >
              <UTextarea
                v-model="form.description"
                placeholder="Pequeno resumo que aparece nos cartões do evento."
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Descrição completa"
              :error="errors.longDescription"
            >
              <UTextarea
                v-model="form.longDescription"
                placeholder="Texto completo da página individual do evento."
                size="lg"
                :rows="6"
              />
            </UFormField>

            <div class="grid gap-5 md:grid-cols-2">
              <UFormField
                label="Data"
                :error="errors.date"
              >
                <UInput
                  v-model="form.date"
                  placeholder="Ex: 15 de Agosto ou Data a anunciar"
                  size="lg"
                />
              </UFormField>

              <UFormField
                label="Hora"
                :error="errors.time"
              >
                <UInput
                  v-model="form.time"
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
                placeholder="Ex: Sede do CCD"
                size="lg"
              />
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Bilheteira e inscrições
            </h2>
          </template>

          <div class="grid gap-5 md:grid-cols-3">
            <UFormField
              label="Preço sócio"
              :error="errors.priceMember"
            >
              <UInput
                v-model="form.priceMember"
                placeholder="Ex: 12€"
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Preço não sócio"
              :error="errors.priceNonMember"
            >
              <UInput
                v-model="form.priceNonMember"
                placeholder="Ex: 15€"
                size="lg"
              />
            </UFormField>

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
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Estado e categoria
            </h2>
          </template>

          <div class="space-y-5">
            <UFormField label="Estado">
              <USelect
                v-model="form.status"
                :items="statusOptions"
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Categoria"
              :error="errors.category"
            >
              <USelect
                v-model="form.category"
                :items="categoryOptions"
                placeholder="Escolher categoria"
                size="lg"
              />
            </UFormField>

            <UFormField label="Ícone do evento">
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="emoji in emojiOptions"
                  :key="emoji"
                  type="button"
                  class="rounded-xl border p-3 text-2xl transition hover:bg-gray-50"
                  :class="form.imageEmoji === emoji
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200'"
                  @click="form.imageEmoji = emoji"
                >
                  {{ emoji }}
                </button>
              </div>
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Pré-visualização
            </h2>
          </template>

          <div class="rounded-2xl border border-gray-200 p-5">
            <div class="flex h-24 items-center justify-center rounded-xl bg-gray-100 text-5xl">
              {{ form.imageEmoji }}
            </div>

            <p class="mt-4 text-sm font-medium text-primary">
              {{ form.category || 'Categoria' }}
            </p>

            <h3 class="mt-1 text-lg font-bold text-gray-950">
              {{ form.title || 'Título do evento' }}
            </h3>

            <p class="mt-2 text-sm text-gray-600">
              {{ form.description || 'Descrição curta do evento.' }}
            </p>

            <p class="mt-4 text-sm text-gray-500">
              {{ form.date || 'Data' }} · {{ form.time || 'Hora' }}
            </p>
          </div>

          <template #footer>
            <UButton
              type="submit"
              size="lg"
              block
            >
              Criar evento
            </UButton>
          </template>
        </UCard>
      </div>
    </form>
  </UContainer>
</template>