<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'

const props = defineProps<{
  eventId: number
  eventSlug: string
  eventTitle: string
  priceMember: string
  priceNonMember: string
}>()

const { addRegistration } = useEvents()

const submitted = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  quantity: 1,
  isMember: false,
  notes: ''
})

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  quantity: ''
})

const parsePrice = (price: string) => {
  const normalizedPrice = price
    .replace('€', '')
    .replace(',', '.')
    .trim()

  const value = Number(normalizedPrice)

  if (Number.isNaN(value)) {
    return 0
  }

  return value
}

const unitPrice = computed(() => {
  return form.isMember
    ? parsePrice(props.priceMember)
    : parsePrice(props.priceNonMember)
})

const totalAmount = computed(() => {
  return unitPrice.value * form.quantity
})

const clearErrors = () => {
  errors.name = ''
  errors.email = ''
  errors.phone = ''
  errors.quantity = ''
}

const validateForm = () => {
  clearErrors()

  if (!form.name.trim()) {
    errors.name = 'O nome é obrigatório.'
  }

  if (!form.email.trim()) {
    errors.email = 'O email é obrigatório.'
  } else if (!form.email.includes('@')) {
    errors.email = 'Insere um email válido.'
  }

  if (!form.phone.trim()) {
    errors.phone = 'O telefone é obrigatório.'
  }

  if (!form.quantity || form.quantity < 1) {
    errors.quantity = 'Escolhe pelo menos 1 lugar.'
  }

  return !errors.name && !errors.email && !errors.phone && !errors.quantity
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  addRegistration({
    eventId: props.eventId,
    name: form.name,
    email: form.email,
    phone: form.phone,
    quantity: form.quantity,
    isMember: form.isMember,
    totalAmount: totalAmount.value,
    notes: form.notes
  })

  submitted.value = true
}

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.quantity = 1
  form.isMember = false
  form.notes = ''

  clearErrors()

  submitted.value = false
}
</script>

<template>
  <UCard>
    <template #header>
      <div>
        <h2 class="text-xl font-bold text-gray-950">
          Inscrição no evento
        </h2>

        <p class="mt-1 text-sm text-gray-600">
          Preenche os dados para reservar o teu lugar.
        </p>
      </div>
    </template>

    <div
      v-if="submitted"
      class="rounded-xl border border-green-200 bg-green-50 p-4"
    >
      <h3 class="font-semibold text-green-900">
        Inscrição registada com sucesso!
      </h3>

      <p class="mt-2 text-sm text-green-800">
        A inscrição foi adicionada ao estado temporário da aplicação e já deve aparecer
        no backoffice deste evento como pagamento pendente.
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <UButton
          :to="`/admin/eventos/${props.eventSlug}`"
          variant="outline"
        >
          Ver no backoffice
        </UButton>

        <UButton
          variant="ghost"
          @click="resetForm"
        >
          Fazer nova inscrição
        </UButton>
      </div>
    </div>

    <form
      v-else
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <UFormField
        label="Nome completo"
        :error="errors.name"
      >
        <UInput
          v-model="form.name"
          placeholder="Ex: Lucas Fiolhais"
          size="lg"
        />
      </UFormField>

      <UFormField
        label="Email"
        :error="errors.email"
      >
        <UInput
          v-model="form.email"
          type="email"
          placeholder="email@exemplo.com"
          size="lg"
        />
      </UFormField>

      <UFormField
        label="Telefone"
        :error="errors.phone"
      >
        <UInput
          v-model="form.phone"
          placeholder="912 345 678"
          size="lg"
        />
      </UFormField>

      <UFormField
        label="Número de pessoas"
        :error="errors.quantity"
      >
        <UInput
          v-model.number="form.quantity"
          type="number"
          min="1"
          max="10"
          size="lg"
        />
      </UFormField>

      <div class="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
        <input
          id="isMember"
          v-model="form.isMember"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-gray-300"
        >

        <label
          for="isMember"
          class="text-sm text-gray-700"
        >
          Sou sócio do CCD de Fiolhais
        </label>
      </div>

      <UFormField label="Observações">
        <UTextarea
          v-model="form.notes"
          placeholder="Ex: informação adicional, restrições alimentares, etc."
          size="lg"
        />
      </UFormField>

      <div class="rounded-xl bg-gray-50 p-4 text-sm">
        <div class="flex justify-between gap-4">
          <span class="text-gray-600">Evento</span>
          <span class="font-medium text-gray-950">{{ props.eventTitle }}</span>
        </div>

        <div class="mt-2 flex justify-between gap-4">
          <span class="text-gray-600">Lugares</span>
          <span class="font-medium text-gray-950">{{ form.quantity }}</span>
        </div>

        <div class="mt-2 flex justify-between gap-4">
          <span class="text-gray-600">Tipo</span>
          <span class="font-medium text-gray-950">
            {{ form.isMember ? 'Sócio' : 'Não sócio' }}
          </span>
        </div>

        <div class="mt-2 flex justify-between gap-4">
          <span class="text-gray-600">Preço unitário</span>
          <span class="font-medium text-gray-950">
            {{ unitPrice }}€
          </span>
        </div>

        <div class="mt-3 flex justify-between gap-4 border-t border-gray-200 pt-3">
          <span class="font-medium text-gray-700">Total</span>
          <span class="font-bold text-gray-950">
            {{ totalAmount }}€
          </span>
        </div>
      </div>

      <UButton
        type="submit"
        size="lg"
        block
      >
        Confirmar inscrição
      </UButton>
    </form>
  </UCard>
</template>