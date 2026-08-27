<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'
import type { EventStatus } from '~/types/event'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const { getEventBySlug, updateEvent } = useEvents()

const event = computed(() => {
  return getEventBySlug(String(route.params.slug))
})

const form = reactive({
  title: '',
  description: '',
  longDescription: '',
  date: '',
  time: '',
  location: '',
  priceMember: '',
  priceNonMember: '',
  capacity: 1,
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

watchEffect(() => {
  if (!event.value) {
    return
  }

  form.title = event.value.title
  form.description = event.value.description
  form.longDescription = event.value.longDescription
  form.date = event.value.date
  form.time = event.value.time
  form.location = event.value.location
  form.priceMember = event.value.priceMember
  form.priceNonMember = event.value.priceNonMember
  form.capacity = event.value.capacity
  form.status = event.value.status
  form.imageEmoji = event.value.imageEmoji
  form.category = event.value.category
})

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

const selectEmoji = (emoji: string) => {
  form.imageEmoji = emoji
}

const handleSubmit = async () => {
  if (!event.value) {
    return
  }

  if (!validateForm()) {
    return
  }

  const updatedEvent = updateEvent(event.value.slug, {
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

  if (!updatedEvent) {
    return
  }

  await router.push(`/admin/eventos/${updatedEvent.slug}`)
}
</script>

<template>
  <UContainer class="py-10">
    <UButton
      :to="event ? `/admin/eventos/${event.slug}` : '/admin/eventos'"
      variant="link"
      class="mb-6 px-0"
    >
      ← Voltar ao evento
    </UButton>

    <div
      v-if="event"
      class="mb-8"
    >
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">
        Editar evento
      </p>

      <h1 class="mt-2 text-3xl font-bold text-gray-950">
        Editar {{ event.title }}
      </h1>

      <p class="mt-2 text-gray-600">
        Atualiza os dados do evento, estado das inscrições, preços e capacidade.
      </p>
    </div>

    <form
      v-if="event"
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
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Descrição curta"
              :error="errors.description"
            >
              <UTextarea
                v-model="form.description"
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Descrição completa"
              :error="errors.longDescription"
            >
              <UTextarea
                v-model="form.longDescription"
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
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Preço não sócio"
              :error="errors.priceNonMember"
            >
              <UInput
                v-model="form.priceNonMember"
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
                  @click="selectEmoji(emoji)"
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
            <div class="space-y-3">
              <UButton
                type="submit"
                size="lg"
                block
              >
                Guardar alterações
              </UButton>

              <UButton
                :to="`/admin/eventos/${event.slug}`"
                variant="outline"
                block
              >
                Cancelar
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </form>

    <UCard
      v-else
      class="text-center"
    >
      <h1 class="text-2xl font-bold text-gray-950">
        Evento não encontrado
      </h1>

      <p class="mt-2 text-gray-600">
        Não foi possível encontrar o evento indicado.
      </p>

      <UButton
        to="/admin/eventos"
        class="mt-6"
      >
        Voltar aos eventos
      </UButton>
    </UCard>
  </UContainer>
</template>