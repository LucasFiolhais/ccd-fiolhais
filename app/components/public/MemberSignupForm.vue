<script setup lang="ts">
import { useMembers } from '~/composables/useMembers'

const { createMember } = useMembers()

const submitted = ref(false)
const createdMemberNumber = ref<string | null>(null)

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  birthDate: '',
  wantsNewsletter: true,
  acceptsTerms: false,
  notes: ''
})

const errors = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  acceptsTerms: ''
})

const clearErrors = () => {
  errors.fullName = ''
  errors.email = ''
  errors.phone = ''
  errors.address = ''
  errors.acceptsTerms = ''
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

  if (!form.address.trim()) {
    errors.address = 'A morada é obrigatória.'
  }

  if (!form.acceptsTerms) {
    errors.acceptsTerms = 'Tens de aceitar o tratamento dos dados para enviar o pedido.'
  }

  return (
    !errors.fullName &&
    !errors.email &&
    !errors.phone &&
    !errors.address &&
    !errors.acceptsTerms
  )
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  const notes = [
    'Pedido submetido através do formulário público.',
    form.wantsNewsletter
      ? 'Aceitou receber avisos por email.'
      : 'Não pretende receber avisos por email.',
    form.notes.trim() ? `Observações: ${form.notes.trim()}` : ''
  ]
    .filter(Boolean)
    .join('\n')

  const newMember = createMember({
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    address: form.address,
    birthDate: form.birthDate,
    status: 'pending',
    notes
  })

  createdMemberNumber.value = newMember.number
  submitted.value = true
}

const resetForm = () => {
  form.fullName = ''
  form.email = ''
  form.phone = ''
  form.address = ''
  form.birthDate = ''
  form.wantsNewsletter = true
  form.acceptsTerms = false
  form.notes = ''

  createdMemberNumber.value = null

  clearErrors()
  submitted.value = false
}
</script>

<template>
  <UCard>
    <template #header>
      <div>
        <h2 class="text-2xl font-bold text-gray-950">
          Pedido de inscrição de sócio
        </h2>

        <p class="mt-2 text-sm text-gray-600">
          Preenche os teus dados. A direção do CCD poderá depois validar o pedido.
        </p>
      </div>
    </template>

    <div
      v-if="submitted"
      class="rounded-xl border border-green-200 bg-green-50 p-5"
    >
      <h3 class="text-lg font-semibold text-green-900">
        Pedido enviado com sucesso!
      </h3>

      <p class="mt-2 text-sm text-green-800">
        O pedido foi registado como sócio pendente e já aparece no backoffice.
      </p>

      <p
        v-if="createdMemberNumber"
        class="mt-3 text-sm font-medium text-green-900"
      >
        Número provisório de sócio: {{ createdMemberNumber }}
      </p>

      <div class="mt-5 flex flex-wrap gap-2">
        <UButton
          v-if="createdMemberNumber"
          :to="`/admin/socios/${createdMemberNumber}`"
          variant="outline"
        >
          Ver no backoffice
        </UButton>

        <UButton
          variant="ghost"
          @click="resetForm"
        >
          Enviar outro pedido
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
        :error="errors.fullName"
      >
        <UInput
          v-model="form.fullName"
          placeholder="Ex: Lucas Fiolhais"
          size="lg"
        />
      </UFormField>

      <div class="grid gap-5 md:grid-cols-2">
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
      </div>

      <UFormField
        label="Morada"
        :error="errors.address"
      >
        <UTextarea
          v-model="form.address"
          placeholder="Rua, número, localidade e código postal"
          size="lg"
        />
      </UFormField>

      <UFormField label="Data de nascimento">
        <UInput
          v-model="form.birthDate"
          type="date"
          size="lg"
        />
      </UFormField>

      <UFormField label="Observações">
        <UTextarea
          v-model="form.notes"
          placeholder="Podes deixar alguma informação adicional, se quiseres."
          size="lg"
        />
      </UFormField>

      <div class="space-y-3 rounded-xl border border-gray-200 p-4">
        <label class="flex items-start gap-3 text-sm text-gray-700">
          <input
            v-model="form.wantsNewsletter"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-gray-300"
          >

          <span>
            Quero receber avisos sobre eventos, assembleias e iniciativas do CCD.
          </span>
        </label>

        <label class="flex items-start gap-3 text-sm text-gray-700">
          <input
            v-model="form.acceptsTerms"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-gray-300"
          >

          <span>
            Autorizo o tratamento dos meus dados para efeitos de inscrição como sócio.
          </span>
        </label>

        <p
          v-if="errors.acceptsTerms"
          class="text-sm text-red-600"
        >
          {{ errors.acceptsTerms }}
        </p>
      </div>

      <UButton
        type="submit"
        size="lg"
        block
      >
        Enviar pedido de inscrição
      </UButton>
    </form>
  </UCard>
</template>