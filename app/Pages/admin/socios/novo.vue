<script setup lang="ts">
import {
  useSupabaseAdminMembers,
  type AdminMemberStatus
} from '~/composables/useSupabaseAdminMembers'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  createMember
} = useSupabaseAdminMembers()

useHead({
  title: 'Novo Sócio'
})

const isSubmitting = ref(false)
const submitError = ref('')

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  birthDate: '',
  status: 'pending' as AdminMemberStatus,
  notes: ''
})

const errors = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: ''
})

const statusOptions = [
  {
    label: 'Ativo',
    value: 'active'
  },
  {
    label: 'Pendente',
    value: 'pending'
  },
  {
    label: 'Inativo',
    value: 'inactive'
  }
]

const clearErrors = () => {
  errors.fullName = ''
  errors.email = ''
  errors.phone = ''
  errors.address = ''

  submitError.value = ''
}

const validateForm = () => {
  clearErrors()

  if (!form.fullName.trim()) {
    errors.fullName =
      'O nome completo é obrigatório.'
  }

  if (!form.email.trim()) {
    errors.email =
      'O email é obrigatório.'
  } else if (!form.email.includes('@')) {
    errors.email =
      'Insere um email válido.'
  }

  if (!form.phone.trim()) {
    errors.phone =
      'O telefone é obrigatório.'
  }

  if (!form.address.trim()) {
    errors.address =
      'A morada é obrigatória.'
  }

  return (
    !errors.fullName &&
    !errors.email &&
    !errors.phone &&
    !errors.address
  )
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  const result = await createMember({
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    address: form.address,
    birthDate:
      form.birthDate || undefined,
    status: form.status,
    notes:
      form.notes || undefined
  })

  isSubmitting.value = false

  if (
    !result.success ||
    !result.member
  ) {
    submitError.value =
      result.error ||
      'Não foi possível criar o sócio.'

    return
  }

  await router.push(
    `/admin/socios/${result.member.number}`
  )
}
</script>

<template>
  <UContainer class="py-10">
    <NuxtLink
      to="/admin/socios"
      class="mb-6 inline-block text-sm font-semibold text-amber-700 hover:text-amber-600"
    >
      ← Voltar aos sócios
    </NuxtLink>

    <div class="mx-auto max-w-3xl">
      <div class="mb-8">
        <p class="text-sm font-bold uppercase tracking-wide text-amber-600">
          Administração
        </p>

        <h1 class="mt-2 text-3xl font-black text-gray-950">
          Novo sócio
        </h1>

        <p class="mt-3 text-gray-600">
          Regista manualmente um novo sócio no sistema.
        </p>
      </div>

      <div
        v-if="submitError"
        class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
      >
        <p class="font-bold">
          Não foi possível criar o sócio
        </p>

        <p class="mt-2">
          {{ submitError }}
        </p>
      </div>

      <form
        class="rounded-3xl border border-amber-200 bg-white shadow-sm"
        @submit.prevent="handleSubmit"
      >
        <div class="space-y-5 p-6">
          <UFormField
            label="Nome completo"
            :error="errors.fullName"
          >
            <UInput
              v-model="form.fullName"
              size="lg"
              placeholder="Nome do sócio"
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
                size="lg"
                placeholder="email@exemplo.pt"
              />
            </UFormField>

            <UFormField
              label="Telefone"
              :error="errors.phone"
            >
              <UInput
                v-model="form.phone"
                size="lg"
                placeholder="912345678"
              />
            </UFormField>
          </div>

          <UFormField
            label="Morada"
            :error="errors.address"
          >
            <UTextarea
              v-model="form.address"
              :rows="3"
              placeholder="Morada completa"
            />
          </UFormField>

          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Data de nascimento">
              <UInput
                v-model="form.birthDate"
                type="date"
                size="lg"
              />
            </UFormField>

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
          </div>

          <UFormField label="Observações">
            <UTextarea
              v-model="form.notes"
              :rows="4"
              placeholder="Informação adicional sobre o sócio."
            />
          </UFormField>
        </div>

        <div class="flex flex-col gap-3 border-t border-gray-200 p-6 sm:flex-row sm:justify-end">
          <NuxtLink
            to="/admin/socios"
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
                ? 'A criar...'
                : 'Criar sócio'
            }}
          </button>
        </div>
      </form>
    </div>
  </UContainer>
</template>