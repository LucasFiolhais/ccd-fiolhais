<script setup lang="ts">
import { useSupabaseAdminMemberAccounts } from '~/composables/useSupabaseAdminMemberAccounts'

const props = defineProps<{
  memberId: string
  userId?: string
  email: string
  status: 'pending' | 'active' | 'inactive'
}>()

const emit = defineEmits<{
  created: []
}>()

const {
  inviteMemberAccount
} = useSupabaseAdminMemberAccounts()

const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

const hasAccount = computed(() => {
  return Boolean(props.userId)
})

const canCreateAccount = computed(() => {
  return (
    !hasAccount.value &&
    props.status === 'active' &&
    Boolean(props.email)
  )
})

const handleCreateAccount = async () => {
  if (!canCreateAccount.value) {
    return
  }

  const confirmed = confirm(
    `Enviar um convite de acesso para ${props.email}?`
  )

  if (!confirmed) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  successMessage.value = ''

  const result =
    await inviteMemberAccount(
      props.memberId
    )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value =
      result.error ||
      'Não foi possível criar a conta.'

    return
  }

  successMessage.value =
    result.message ||
    'Conta criada com sucesso.'

  emit('created')
}
</script>

<template>
  <section class="rounded-3xl border border-amber-200 bg-white shadow-sm">
    <div class="border-b border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-950">
        Área do Sócio
      </h2>

      <p class="mt-2 text-gray-600">
        Gere o acesso deste sócio à área privada da plataforma.
      </p>
    </div>

    <div class="space-y-5 p-6">
      <div
        v-if="hasAccount"
        class="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
      >
        <div class="flex gap-3">
          <span class="text-2xl">
            ✅
          </span>

          <div>
            <p class="font-bold text-emerald-900">
              Conta associada
            </p>

            <p class="mt-1 text-sm leading-6 text-emerald-800">
              Este sócio já possui uma conta de acesso à Área do Sócio.
            </p>

            <p class="mt-2 break-all text-sm text-emerald-700">
              {{ email }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-2xl border border-amber-200 bg-amber-50 p-5"
      >
        <p class="font-bold text-amber-950">
          Conta ainda não criada
        </p>

        <p class="mt-2 text-sm leading-6 text-amber-900">
          Pode ser enviado um convite para o email registado do sócio.
        </p>

        <p class="mt-2 break-all text-sm font-semibold text-amber-800">
          {{ email || 'Sem email registado' }}
        </p>
      </div>

      <div
        v-if="status !== 'active' && !hasAccount"
        class="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700"
      >
        Ativa primeiro o sócio para poderes criar a conta online.
      </div>

      <div
        v-if="submitError"
        class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
      >
        {{ submitError }}
      </div>

      <div
        v-if="successMessage"
        class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
      >
        {{ successMessage }}
      </div>

      <button
        v-if="!hasAccount"
        type="button"
        class="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canCreateAccount || isSubmitting"
        @click="handleCreateAccount"
      >
        {{
          isSubmitting
            ? 'A criar conta...'
            : 'Enviar convite para Área do Sócio'
        }}
      </button>
    </div>
  </section>
</template>