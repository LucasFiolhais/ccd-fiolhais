<script setup lang="ts">
import {
  useSupabaseAdminMembers,
  type AdminMember,
  type AdminMemberStatus
} from '~/composables/useSupabaseAdminMembers'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()

const {
  getMemberByNumber,
  updateMember
} = useSupabaseAdminMembers()

const member = ref<AdminMember | null>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

const memberNumber = computed(() => {
  return String(route.params.number)
})

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  birthDate: '',
  joinedAt: '',
  status: 'active' as AdminMemberStatus,
  notes: ''
})

const errors = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  joinedAt: ''
})

const statusOptions: Array<{
  label: string
  value: AdminMemberStatus
}> = [
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

useHead(() => {
  return {
    title: member.value ? `Editar sócio ${member.value.number}` : 'Editar sócio'
  }
})

const clearErrors = () => {
  errors.fullName = ''
  errors.email = ''
  errors.phone = ''
  errors.address = ''
  errors.joinedAt = ''
  submitError.value = ''
  successMessage.value = ''
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

  if (!form.joinedAt) {
    errors.joinedAt = 'A data de inscrição é obrigatória.'
  }

  return (
    !errors.fullName &&
    !errors.email &&
    !errors.phone &&
    !errors.address &&
    !errors.joinedAt
  )
}

const fillForm = (selectedMember: AdminMember) => {
  form.fullName = selectedMember.fullName
  form.email = selectedMember.email
  form.phone = selectedMember.phone
  form.address = selectedMember.address
  form.birthDate = selectedMember.birthDate || ''
  form.joinedAt = selectedMember.joinedAt
  form.status = selectedMember.status
  form.notes = selectedMember.notes || ''
}

const loadMember = async () => {
  isLoading.value = true
  submitError.value = ''
  successMessage.value = ''

  const result = await getMemberByNumber(memberNumber.value)

  isLoading.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível carregar o sócio.'
    return
  }

  member.value = result.member

  if (result.member) {
    fillForm(result.member)
  }
}

const handleSubmit = async () => {
  if (!member.value) {
    return
  }

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  const result = await updateMember(member.value.id, {
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    birthDate: form.birthDate || undefined,
    joinedAt: form.joinedAt,
    status: form.status,
    notes: form.notes.trim() || undefined
  })

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível guardar as alterações.'
    return
  }

  successMessage.value = 'Dados do sócio atualizados com sucesso.'
  await loadMember()
}

const handleCancel = async () => {
  await navigateTo(`/admin/socios/${memberNumber.value}`)
}

onMounted(async () => {
  await loadMember()
})
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <NuxtLink
        :to="`/admin/socios/${memberNumber}`"
        class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
      >
        ← Voltar ao sócio
      </NuxtLink>
    </div>

    <div
      v-if="isLoading"
      class="rounded-3xl border border-amber-200 bg-white p-8 text-center text-gray-600 shadow-sm"
    >
      A carregar dados do sócio...
    </div>

    <div
      v-else-if="submitError && !member"
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
      v-else-if="member"
      class="space-y-8"
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
            Sócio nº {{ member.number }}
          </p>

          <h1 class="mt-2 text-3xl font-bold text-gray-950">
            Editar dados do sócio
          </h1>

          <p class="mt-2 text-gray-600">
            Atualiza os dados pessoais, contactos e estado do sócio na base de dados Supabase.
          </p>
        </div>

        <button
          type="button"
          class="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          @click="handleCancel"
        >
          Cancelar
        </button>
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
          Alterações guardadas
        </p>

        <p class="mt-2">
          {{ successMessage }}
        </p>
      </div>

      <form
        class="rounded-3xl border border-amber-200 bg-white shadow-sm"
        @submit.prevent="handleSubmit"
      >
        <div class="border-b border-gray-200 p-6">
          <h2 class="text-2xl font-bold text-gray-950">
            Dados principais
          </h2>

          <p class="mt-2 text-gray-600">
            O número de sócio não é editado nesta fase para evitar conflitos com outros sócios.
          </p>
        </div>

        <div class="space-y-6 p-6">
          <div class="grid gap-5 md:grid-cols-2">
            <div>
              <label class="text-sm font-semibold text-gray-800">
                Número de sócio
              </label>

              <input
                :value="member.number"
                type="text"
                disabled
                class="mt-2 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 outline-none"
              >
            </div>

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
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-800">
              Nome completo
            </label>

            <input
              v-model="form.fullName"
              type="text"
              placeholder="Nome completo"
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

          <div>
            <label class="text-sm font-semibold text-gray-800">
              Morada
            </label>

            <textarea
              v-model="form.address"
              rows="3"
              placeholder="Morada completa"
              class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              :class="errors.address ? 'border-red-400' : 'border-gray-300'"
            />

            <p
              v-if="errors.address"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.address }}
            </p>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <div>
              <label class="text-sm font-semibold text-gray-800">
                Data de nascimento
              </label>

              <input
                v-model="form.birthDate"
                type="date"
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800">
                Data de inscrição
              </label>

              <input
                v-model="form.joinedAt"
                type="date"
                class="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                :class="errors.joinedAt ? 'border-red-400' : 'border-gray-300'"
              >

              <p
                v-if="errors.joinedAt"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors.joinedAt }}
              </p>
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-800">
              Observações
            </label>

            <textarea
              v-model="form.notes"
              rows="4"
              placeholder="Notas internas sobre o sócio"
              class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>

        <div class="flex flex-col gap-3 border-t border-gray-200 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            @click="handleCancel"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'A guardar...' : 'Guardar alterações' }}
          </button>
        </div>
      </form>
    </div>

    <SharedEmptyState
      v-else
      icon="👥"
      title="Sócio não encontrado"
      description="Não existe nenhum sócio com este número na base de dados."
      action-label="Voltar aos sócios"
      action-to="/admin/socios"
    />
  </UContainer>
</template>