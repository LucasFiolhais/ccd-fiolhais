<script setup lang="ts">
import {
  useSupabaseAdminMembers,
  type AdminMember,
  type AdminMemberStatus,
} from '~/composables/useSupabaseAdminMembers'

import type { AdminQuotaStatus } from '~/composables/useSupabaseAdminQuotas'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()

const {
  getMemberByNumber,
  updateMemberStatus,
  updateQuotaStatus,
  createCurrentYearQuota
} = useSupabaseAdminMembers()

const member = ref<AdminMember | null>(null)

const isLoading = ref(true)
const isSubmitting = ref(false)

const submitError = ref('')
const successMessage = ref('')

const memberNumber = computed(() => {
  return String(route.params.number)
})

const currentYear = new Date().getFullYear()

useHead(() => {
  return {
    title: member.value
      ? `Sócio ${member.value.number}`
      : 'Sócio'
  }
})

const getMemberStatusLabel = (
  status: AdminMemberStatus
) => {
  if (status === 'active') {
    return 'Ativo'
  }

  if (status === 'pending') {
    return 'Pendente'
  }

  return 'Inativo'
}

const getMemberStatusClass = (
  status: AdminMemberStatus
) => {
  if (status === 'active') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'pending') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  return 'border-gray-200 bg-gray-50 text-gray-600'
}

const getQuotaStatusLabel = (
  status: AdminQuotaStatus
) => {
  if (status === 'paid') {
    return 'Paga'
  }

  if (status === 'pending') {
    return 'Pendente'
  }

  if (status === 'overdue') {
    return 'Em atraso'
  }

  return 'Isenta'
}

const getQuotaStatusClass = (
  status: AdminQuotaStatus
) => {
  if (status === 'paid') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'pending') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  if (status === 'overdue') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  return 'border-sky-200 bg-sky-50 text-sky-700'
}

const formatDate = (value?: string) => {
  if (!value) {
    return 'Não indicada'
  }

  const date = value.includes('T')
    ? new Date(value)
    : new Date(`${value}T00:00:00`)

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'long'
  }).format(date)
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const paidQuotasCount = computed(() => {
  if (!member.value) {
    return 0
  }

  return member.value.quotas.filter((quota) => {
    return quota.status === 'paid'
  }).length
})

const pendingOrOverdueQuotasCount = computed(() => {
  if (!member.value) {
    return 0
  }

  return member.value.quotas.filter((quota) => {
    return (
      quota.status === 'pending' ||
      quota.status === 'overdue'
    )
  }).length
})

const totalPaidAmount = computed(() => {
  if (!member.value) {
    return 0
  }

  return member.value.quotas
    .filter((quota) => {
      return quota.status === 'paid'
    })
    .reduce((total, quota) => {
      return total + quota.amount
    }, 0)
})

const loadMember = async () => {
  isLoading.value = true
  submitError.value = ''
  successMessage.value = ''

  const result =
    await getMemberByNumber(
      memberNumber.value
    )

  isLoading.value = false

  if (!result.success) {
    submitError.value =
      result.error ||
      'Não foi possível carregar o sócio.'

    member.value = null

    return
  }

  member.value = result.member
}

const handleReload = async () => {
  await loadMember()
}

const handleMemberStatus = async (
  status: AdminMemberStatus
) => {
  if (!member.value) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  successMessage.value = ''

  const result =
    await updateMemberStatus(
      member.value.id,
      status
    )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value =
      result.error ||
      'Não foi possível atualizar o estado do sócio.'

    return
  }

  successMessage.value =
    'Estado do sócio atualizado com sucesso.'

  await loadMember()
}

const handleQuotaStatus = async (
  quotaId: string,
  status: AdminQuotaStatus
) => {
  isSubmitting.value = true
  submitError.value = ''
  successMessage.value = ''

  const result =
    await updateQuotaStatus(
      quotaId,
      status
    )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value =
      result.error ||
      'Não foi possível atualizar a quota.'

    return
  }

  successMessage.value =
    'Estado da quota atualizado com sucesso.'

  await loadMember()
}

const handleCreateCurrentQuota = async () => {
  if (!member.value) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  successMessage.value = ''

  const result =
    await createCurrentYearQuota(
      member.value.id
    )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value =
      result.error ||
      'Não foi possível criar a quota.'

    return
  }

  successMessage.value =
    `Quota de ${currentYear} criada com sucesso.`

  await loadMember()
}

onMounted(async () => {
  await loadMember()
})
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <NuxtLink
        to="/admin/socios"
        class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
      >
        ← Voltar aos sócios
      </NuxtLink>
    </div>

    <div
      v-if="isLoading"
      class="rounded-3xl border border-amber-200 bg-white p-10 text-center text-gray-600 shadow-sm"
    >
      A carregar sócio...
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
      <!-- Cabeçalho -->
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
            Sócio nº {{ member.number }}
          </p>

          <h1 class="mt-2 text-3xl font-bold text-gray-950">
            {{ member.fullName }}
          </h1>

          <div class="mt-4">
            <span
              class="rounded-full border px-3 py-1 text-xs font-bold"
              :class="getMemberStatusClass(member.status)"
            >
              {{ getMemberStatusLabel(member.status) }}
            </span>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-xl border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
            @click="handleReload"
          >
            Recarregar
          </button>

          <NuxtLink
            :to="`/admin/socios/${member.number}/editar`"
            class="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Editar dados
          </NuxtLink>

          <button
            v-if="member.status !== 'active'"
            type="button"
            class="rounded-xl border border-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting"
            @click="handleMemberStatus('active')"
          >
            Ativar sócio
          </button>

          <button
            v-if="member.status === 'active'"
            type="button"
            class="rounded-xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting"
            @click="handleMemberStatus('inactive')"
          >
            Desativar sócio
          </button>
        </div>
      </div>

      <!-- Mensagens -->
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
          Ação concluída
        </p>

        <p class="mt-2">
          {{ successMessage }}
        </p>
      </div>

      <!-- Estatísticas -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Quotas registadas"
          :value="member.quotas.length"
          description="Total no histórico"
        />

        <AdminStatCard
          label="Quotas pagas"
          :value="paidQuotasCount"
          description="Pagamentos registados"
        />

        <AdminStatCard
          label="Pendentes / atraso"
          :value="pendingOrOverdueQuotasCount"
          description="Requerem atenção"
        />

        <AdminStatCard
          label="Total pago"
          :value="formatMoney(totalPaidAmount)"
          description="Histórico registado"
        />
      </div>

      <!-- Dados do sócio -->
      <section class="rounded-3xl border border-amber-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 p-6">
          <h2 class="text-2xl font-bold text-gray-950">
            Dados do sócio
          </h2>

          <p class="mt-2 text-gray-600">
            Informação pessoal e administrativa registada no Supabase.
          </p>
        </div>

        <div class="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          <div class="rounded-2xl bg-gray-50 p-4">
            <p class="text-sm font-semibold text-gray-500">
              Número
            </p>

            <p class="mt-1 text-gray-950">
              {{ member.number }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-4">
            <p class="text-sm font-semibold text-gray-500">
              Nome
            </p>

            <p class="mt-1 text-gray-950">
              {{ member.fullName }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-4">
            <p class="text-sm font-semibold text-gray-500">
              Estado
            </p>

            <p class="mt-1 text-gray-950">
              {{ getMemberStatusLabel(member.status) }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-4">
            <p class="text-sm font-semibold text-gray-500">
              Email
            </p>

            <p class="mt-1 break-all text-gray-950">
              {{ member.email }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-4">
            <p class="text-sm font-semibold text-gray-500">
              Telefone
            </p>

            <p class="mt-1 text-gray-950">
              {{ member.phone }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-4">
            <p class="text-sm font-semibold text-gray-500">
              Data de nascimento
            </p>

            <p class="mt-1 text-gray-950">
              {{ formatDate(member.birthDate) }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-4">
            <p class="text-sm font-semibold text-gray-500">
              Sócio desde
            </p>

            <p class="mt-1 text-gray-950">
              {{ formatDate(member.joinedAt) }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-4 md:col-span-2">
            <p class="text-sm font-semibold text-gray-500">
              Morada
            </p>

            <p class="mt-1 whitespace-pre-line text-gray-950">
              {{ member.address }}
            </p>
          </div>

          <div
            v-if="member.notes"
            class="rounded-2xl bg-gray-50 p-4 md:col-span-2 xl:col-span-3"
          >
            <p class="text-sm font-semibold text-gray-500">
              Observações
            </p>

            <p class="mt-1 whitespace-pre-line text-gray-950">
              {{ member.notes }}
            </p>
          </div>
        </div>
      </section>

      <!-- NOVO: Conta da Área do Sócio -->
      <AdminMemberAccountCard
        :member-id="member.id"
        :user-id="member.userId"
        :email="member.email"
        :status="member.status"
        @created="handleReload"
      />

      <!-- Quota do ano atual -->
      <section class="rounded-3xl border border-amber-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-950">
                Quota {{ currentYear }}
              </h2>

              <p class="mt-2 text-gray-600">
                Estado da quota correspondente ao ano atual.
              </p>
            </div>

            <button
              v-if="!member.currentQuota"
              type="button"
              class="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
              @click="handleCreateCurrentQuota"
            >
              Criar quota {{ currentYear }}
            </button>
          </div>
        </div>

        <div
          v-if="member.currentQuota"
          class="p-6"
        >
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-3xl font-black text-gray-950">
                {{ formatMoney(member.currentQuota.amount) }}
              </p>

              <div class="mt-3">
                <span
                  class="rounded-full border px-3 py-1 text-sm font-bold"
                  :class="getQuotaStatusClass(member.currentQuota.status)"
                >
                  {{ getQuotaStatusLabel(member.currentQuota.status) }}
                </span>
              </div>

              <p
                v-if="member.currentQuota.paidAt"
                class="mt-3 text-sm text-gray-500"
              >
                Pagamento registado em
                {{ formatDate(member.currentQuota.paidAt) }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-if="member.currentQuota.status !== 'paid'"
                type="button"
                class="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                :disabled="isSubmitting"
                @click="handleQuotaStatus(member.currentQuota.id, 'paid')"
              >
                Marcar paga
              </button>

              <button
                v-if="member.currentQuota.status !== 'pending'"
                type="button"
                class="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-60"
                :disabled="isSubmitting"
                @click="handleQuotaStatus(member.currentQuota.id, 'pending')"
              >
                Pendente
              </button>

              <button
                v-if="member.currentQuota.status !== 'overdue'"
                type="button"
                class="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                :disabled="isSubmitting"
                @click="handleQuotaStatus(member.currentQuota.id, 'overdue')"
              >
                Em atraso
              </button>

              <button
                v-if="member.currentQuota.status !== 'exempt'"
                type="button"
                class="rounded-xl border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:opacity-60"
                :disabled="isSubmitting"
                @click="handleQuotaStatus(member.currentQuota.id, 'exempt')"
              >
                Isenta
              </button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="p-6"
        >
          <SharedEmptyState
            icon="💶"
            title="Quota ainda não criada"
            :description="`Este sócio ainda não tem uma quota registada para ${currentYear}.`"
          />
        </div>
      </section>

      <!-- Histórico -->
      <section class="rounded-3xl border border-amber-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 p-6">
          <h2 class="text-2xl font-bold text-gray-950">
            Histórico de quotas
          </h2>

          <p class="mt-2 text-gray-600">
            Todas as quotas associadas a este sócio.
          </p>
        </div>

        <div
          v-if="member.quotas.length"
          class="divide-y divide-gray-200"
        >
          <article
            v-for="quota in member.quotas"
            :key="quota.id"
            class="p-6"
          >
            <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-xl font-bold text-gray-950">
                  {{ quota.year }}
                </p>

                <p class="mt-1 text-gray-600">
                  {{ formatMoney(quota.amount) }}
                </p>

                <p
                  v-if="quota.paidAt"
                  class="mt-2 text-sm text-gray-500"
                >
                  Pago em {{ formatDate(quota.paidAt) }}
                </p>
              </div>

              <div class="flex flex-col gap-3 lg:items-end">
                <span
                  class="self-start rounded-full border px-3 py-1 text-sm font-bold lg:self-auto"
                  :class="getQuotaStatusClass(quota.status)"
                >
                  {{ getQuotaStatusLabel(quota.status) }}
                </span>

                <div class="flex flex-wrap gap-2">
                  <button
                    v-if="quota.status !== 'paid'"
                    type="button"
                    class="rounded-xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                    :disabled="isSubmitting"
                    @click="handleQuotaStatus(quota.id, 'paid')"
                  >
                    Paga
                  </button>

                  <button
                    v-if="quota.status !== 'pending'"
                    type="button"
                    class="rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-60"
                    :disabled="isSubmitting"
                    @click="handleQuotaStatus(quota.id, 'pending')"
                  >
                    Pendente
                  </button>

                  <button
                    v-if="quota.status !== 'overdue'"
                    type="button"
                    class="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    :disabled="isSubmitting"
                    @click="handleQuotaStatus(quota.id, 'overdue')"
                  >
                    Em atraso
                  </button>

                  <button
                    v-if="quota.status !== 'exempt'"
                    type="button"
                    class="rounded-xl border border-sky-300 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 disabled:opacity-60"
                    :disabled="isSubmitting"
                    @click="handleQuotaStatus(quota.id, 'exempt')"
                  >
                    Isenta
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <SharedEmptyState
          v-else
          class="m-6"
          icon="💶"
          title="Sem histórico de quotas"
          description="Ainda não existem quotas associadas a este sócio."
        />
      </section>
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