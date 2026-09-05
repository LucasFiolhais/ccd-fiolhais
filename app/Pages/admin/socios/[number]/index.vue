<script setup lang="ts">
import {
  useSupabaseAdminMembers,
  type AdminMember,
  type AdminMemberStatus,
  type AdminQuotaStatus
} from '~/composables/useSupabaseAdminMembers'

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

const currentYear = new Date().getFullYear()
const member = ref<AdminMember | null>(null)
const isLoading = ref(true)
const submitError = ref('')
const successMessage = ref('')

const memberNumber = computed(() => {
  return String(route.params.number)
})

useHead(() => {
  return {
    title: member.value ? `Sócio ${member.value.number}` : 'Sócio'
  }
})

const getStatusLabel = (status: AdminMemberStatus) => {
  if (status === 'active') {
    return 'Ativo'
  }

  if (status === 'pending') {
    return 'Pendente'
  }

  return 'Inativo'
}

const getStatusClass = (status: AdminMemberStatus) => {
  if (status === 'active') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'pending') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  return 'border-gray-200 bg-gray-50 text-gray-600'
}

const getQuotaLabel = (status: AdminQuotaStatus) => {
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

const getQuotaClass = (status: AdminQuotaStatus) => {
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

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short'
  }).format(new Date(`${value}T00:00:00`))
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const paidQuotas = computed(() => {
  if (!member.value) {
    return 0
  }

  return member.value.quotas.filter((quota) => quota.status === 'paid').length
})

const pendingQuotas = computed(() => {
  if (!member.value) {
    return 0
  }

  return member.value.quotas.filter((quota) => {
    return quota.status === 'pending' || quota.status === 'overdue'
  }).length
})

const totalPaidAmount = computed(() => {
  if (!member.value) {
    return 0
  }

  return member.value.quotas
    .filter((quota) => quota.status === 'paid')
    .reduce((total, quota) => {
      return total + quota.amount
    }, 0)
})

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
}

const handleReload = async () => {
  await loadMember()
}

const handleActivateMember = async () => {
  if (!member.value) {
    return
  }

  submitError.value = ''
  successMessage.value = ''

  const result = await updateMemberStatus(member.value.id, 'active')

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível ativar o sócio.'
    return
  }

  successMessage.value = 'Sócio ativado com sucesso.'
  await loadMember()
}

const handleDeactivateMember = async () => {
  if (!member.value) {
    return
  }

  submitError.value = ''
  successMessage.value = ''

  const result = await updateMemberStatus(member.value.id, 'inactive')

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível desativar o sócio.'
    return
  }

  successMessage.value = 'Sócio desativado com sucesso.'
  await loadMember()
}

const handleCreateCurrentQuota = async () => {
  if (!member.value) {
    return
  }

  submitError.value = ''
  successMessage.value = ''

  const result = await createCurrentYearQuota(member.value.id)

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível criar a quota do ano atual.'
    return
  }

  successMessage.value = `Quota de ${currentYear} criada com sucesso.`
  await loadMember()
}

const handleUpdateQuotaStatus = async (
  quotaId: string,
  status: AdminQuotaStatus
) => {
  submitError.value = ''
  successMessage.value = ''

  const result = await updateQuotaStatus(quotaId, status)

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível atualizar a quota.'
    return
  }

  successMessage.value = 'Quota atualizada com sucesso.'
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
      class="rounded-3xl border border-amber-200 bg-white p-8 text-center text-gray-600 shadow-sm"
    >
      A carregar dados do sócio...
    </div>

    <div
      v-else-if="submitError"
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
            {{ member.fullName }}
          </h1>

          <div class="mt-4 flex flex-wrap gap-3">
            <span
              class="rounded-full border px-3 py-1 text-xs font-bold"
              :class="getStatusClass(member.status)"
            >
              {{ getStatusLabel(member.status) }}
            </span>

            <span
              v-if="member.currentQuota"
              class="rounded-full border px-3 py-1 text-xs font-bold"
              :class="getQuotaClass(member.currentQuota.status)"
            >
              Quota {{ currentYear }}: {{ getQuotaLabel(member.currentQuota.status) }}
            </span>

            <span
              v-else
              class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-600"
            >
              Sem quota {{ currentYear }}
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
  class="rounded-xl border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
>
  Editar dados
</NuxtLink>

          <button
            v-if="member.status !== 'active'"
            type="button"
            class="rounded-xl border border-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            @click="handleActivateMember"
          >
            Ativar sócio
          </button>

          <button
            v-if="member.status !== 'inactive'"
            type="button"
            class="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            @click="handleDeactivateMember"
          >
            Desativar sócio
          </button>
        </div>
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

      <div class="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          label="Quotas pagas"
          :value="paidQuotas"
          description="Total no histórico"
        />

        <AdminStatCard
          label="Quotas pendentes"
          :value="pendingQuotas"
          description="Pendentes ou em atraso"
        />

        <AdminStatCard
          label="Total pago"
          :value="formatMoney(totalPaidAmount)"
          description="Valor registado"
        />
      </div>

      <div class="grid gap-8 xl:grid-cols-[1fr_1.2fr]">
        <div class="space-y-8">
          <div class="rounded-3xl border border-amber-200 bg-white shadow-sm">
            <div class="border-b border-gray-200 p-6">
              <h2 class="text-2xl font-bold text-gray-950">
                Dados pessoais
              </h2>
            </div>

            <div class="space-y-5 p-6">
              <div>
                <p class="text-sm font-semibold text-gray-500">
                  Nome
                </p>

                <p class="mt-1 text-gray-950">
                  {{ member.fullName }}
                </p>
              </div>

              <div>
                <p class="text-sm font-semibold text-gray-500">
                  Email
                </p>

                <p class="mt-1 break-all text-gray-950">
                  {{ member.email }}
                </p>
              </div>

              <div>
                <p class="text-sm font-semibold text-gray-500">
                  Telefone
                </p>

                <p class="mt-1 text-gray-950">
                  {{ member.phone }}
                </p>
              </div>

              <div>
                <p class="text-sm font-semibold text-gray-500">
                  Morada
                </p>

                <p class="mt-1 whitespace-pre-line text-gray-950">
                  {{ member.address }}
                </p>
              </div>

              <div>
                <p class="text-sm font-semibold text-gray-500">
                  Data de nascimento
                </p>

                <p class="mt-1 text-gray-950">
                  {{ formatDate(member.birthDate) }}
                </p>
              </div>

              <div>
                <p class="text-sm font-semibold text-gray-500">
                  Data de inscrição
                </p>

                <p class="mt-1 text-gray-950">
                  {{ formatDate(member.joinedAt) }}
                </p>
              </div>

              <div v-if="member.notes">
                <p class="text-sm font-semibold text-gray-500">
                  Observações
                </p>

                <p class="mt-1 whitespace-pre-line text-gray-950">
                  {{ member.notes }}
                </p>
              </div>

              <div class="flex flex-wrap gap-4 pt-2">
                <a
                  :href="`mailto:${member.email}`"
                  class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
                >
                  Enviar email
                </a>

                <a
                  :href="`tel:${member.phone}`"
                  class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
                >
                  Contactar por telefone
                </a>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <h2 class="text-2xl font-bold text-gray-950">
              Quota do ano atual
            </h2>

            <div
              v-if="member.currentQuota"
              class="mt-5 rounded-2xl bg-gray-50 p-5"
            >
              <span
                class="rounded-full border px-3 py-1 text-xs font-bold"
                :class="getQuotaClass(member.currentQuota.status)"
              >
                {{ getQuotaLabel(member.currentQuota.status) }}
              </span>

              <p class="mt-4 text-gray-700">
                Ano: <strong>{{ member.currentQuota.year }}</strong>
              </p>

              <p class="mt-1 text-gray-700">
                Valor: <strong>{{ formatMoney(member.currentQuota.amount) }}</strong>
              </p>

              <p
                v-if="member.currentQuota.paidAt"
                class="mt-1 text-gray-700"
              >
                Paga em: <strong>{{ formatDate(member.currentQuota.paidAt) }}</strong>
              </p>

              <div class="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  @click="handleUpdateQuotaStatus(member.currentQuota.id, 'paid')"
                >
                  Marcar paga
                </button>

                <button
                  type="button"
                  class="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                  @click="handleUpdateQuotaStatus(member.currentQuota.id, 'pending')"
                >
                  Marcar pendente
                </button>

                <button
                  type="button"
                  class="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  @click="handleUpdateQuotaStatus(member.currentQuota.id, 'overdue')"
                >
                  Marcar em atraso
                </button>

                <button
                  type="button"
                  class="rounded-xl border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
                  @click="handleUpdateQuotaStatus(member.currentQuota.id, 'exempt')"
                >
                  Marcar isenta
                </button>
              </div>
            </div>

            <div
              v-else
              class="mt-5 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-5 text-amber-950"
            >
              <p class="font-semibold">
                Este sócio ainda não tem quota para {{ currentYear }}.
              </p>

              <button
                type="button"
                class="mt-4 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
                @click="handleCreateCurrentQuota"
              >
                Criar quota {{ currentYear }}
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-amber-200 bg-white shadow-sm">
          <div class="border-b border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-950">
              Histórico de quotas
            </h2>

            <p class="mt-2 text-gray-600">
              Consulta todas as quotas associadas a este sócio.
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
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 class="text-xl font-bold text-gray-950">
                    Quota {{ quota.year }}
                  </h3>

                  <p class="mt-2 text-gray-600">
                    Valor: {{ formatMoney(quota.amount) }}
                  </p>

                  <p
                    v-if="quota.paidAt"
                    class="mt-1 text-gray-600"
                  >
                    Paga em {{ formatDate(quota.paidAt) }}
                  </p>
                </div>

                <span
                  class="w-fit rounded-full border px-3 py-1 text-xs font-bold"
                  :class="getQuotaClass(quota.status)"
                >
                  {{ getQuotaLabel(quota.status) }}
                </span>
              </div>

              <div class="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  @click="handleUpdateQuotaStatus(quota.id, 'paid')"
                >
                  Paga
                </button>

                <button
                  type="button"
                  class="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                  @click="handleUpdateQuotaStatus(quota.id, 'pending')"
                >
                  Pendente
                </button>

                <button
                  type="button"
                  class="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  @click="handleUpdateQuotaStatus(quota.id, 'overdue')"
                >
                  Em atraso
                </button>

                <button
                  type="button"
                  class="rounded-xl border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
                  @click="handleUpdateQuotaStatus(quota.id, 'exempt')"
                >
                  Isenta
                </button>
              </div>
            </article>
          </div>

          <SharedEmptyState
            v-else
            class="m-6"
            icon="💶"
            title="Sem quotas registadas"
            description="Este sócio ainda não tem quotas associadas."
          />
        </div>
      </div>
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