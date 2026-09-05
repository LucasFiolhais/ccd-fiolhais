<script setup lang="ts">
import { exportRowsToCsv } from '~/utils/exportCsv'
import {
  useSupabaseAdminQuotas,
  type AdminMemberWithoutQuota,
  type AdminQuota,
  type AdminQuotaStatus
} from '~/composables/useSupabaseAdminQuotas'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Quotas'
})

type StatusFilter = 'all' | AdminQuotaStatus
type YearFilter = 'all' | string

const currentYear = new Date().getFullYear()

const {
  getQuotas,
  getActiveMembersWithoutQuota,
  updateQuotaStatus,
  createQuotaForMember,
  createMissingQuotas
} = useSupabaseAdminQuotas()

const quotas = ref<AdminQuota[]>([])
const membersWithoutQuota = ref<AdminMemberWithoutQuota[]>([])

const searchTerm = ref('')
const selectedStatus = ref<StatusFilter>('all')
const selectedYear = ref<YearFilter>(String(currentYear))
const quotaAmount = ref(12)

const isLoading = ref(true)
const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

const statusOptions: Array<{
  label: string
  value: StatusFilter
}> = [
  {
    label: 'Todas',
    value: 'all'
  },
  {
    label: 'Pagas',
    value: 'paid'
  },
  {
    label: 'Pendentes',
    value: 'pending'
  },
  {
    label: 'Em atraso',
    value: 'overdue'
  },
  {
    label: 'Isentas',
    value: 'exempt'
  }
]

const yearOptions = computed(() => {
  const years = new Set<number>()

  years.add(currentYear)

  quotas.value.forEach((quota) => {
    years.add(quota.year)
  })

  const sortedYears = [...years].sort((firstYear, secondYear) => {
    return secondYear - firstYear
  })

  return [
    {
      label: 'Todos os anos',
      value: 'all'
    },
    ...sortedYears.map((year) => {
      return {
        label: String(year),
        value: String(year)
      }
    })
  ]
})

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

const getMemberStatusLabel = (status: string) => {
  if (status === 'active') {
    return 'Ativo'
  }

  if (status === 'pending') {
    return 'Pendente'
  }

  return 'Inativo'
}

const formatDate = (value?: string) => {
  if (!value) {
    return 'Não registada'
  }

  const normalizedDate = value.includes('T')
    ? new Date(value)
    : new Date(`${value}T00:00:00`)

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short'
  }).format(normalizedDate)
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const filteredQuotas = computed(() => {
  return quotas.value.filter((quota) => {
    const searchValue = searchTerm.value.toLowerCase()

    const matchesSearch = [
      quota.memberNumber,
      quota.memberFullName,
      quota.memberEmail,
      quota.memberPhone,
      String(quota.year)
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchValue)

    const matchesStatus =
      selectedStatus.value === 'all' ||
      quota.status === selectedStatus.value

    const matchesYear =
      selectedYear.value === 'all' ||
      String(quota.year) === selectedYear.value

    return matchesSearch && matchesStatus && matchesYear
  })
})

const currentYearQuotas = computed(() => {
  return quotas.value.filter((quota) => quota.year === currentYear)
})

const totalCurrentYearQuotas = computed(() => {
  return currentYearQuotas.value.length
})

const paidCurrentYearQuotas = computed(() => {
  return currentYearQuotas.value.filter((quota) => quota.status === 'paid').length
})

const pendingCurrentYearQuotas = computed(() => {
  return currentYearQuotas.value.filter((quota) => quota.status === 'pending').length
})

const overdueCurrentYearQuotas = computed(() => {
  return currentYearQuotas.value.filter((quota) => quota.status === 'overdue').length
})

const receivedAmount = computed(() => {
  return currentYearQuotas.value
    .filter((quota) => quota.status === 'paid')
    .reduce((total, quota) => {
      return total + quota.amount
    }, 0)
})

const loadQuotas = async () => {
  isLoading.value = true
  submitError.value = ''
  successMessage.value = ''

  const quotasResult = await getQuotas()

  if (!quotasResult.success) {
    isLoading.value = false
    submitError.value = quotasResult.error || 'Não foi possível carregar as quotas.'
    return
  }

  quotas.value = quotasResult.quotas

  const missingResult = await getActiveMembersWithoutQuota(currentYear)

  isLoading.value = false

  if (!missingResult.success) {
    submitError.value = missingResult.error || 'Não foi possível verificar sócios sem quota.'
    return
  }

  membersWithoutQuota.value = missingResult.members
}

const handleReload = async () => {
  await loadQuotas()
}

const handleUpdateQuotaStatus = async (
  quotaId: string,
  status: AdminQuotaStatus
) => {
  submitError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  const result = await updateQuotaStatus(quotaId, status)

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível atualizar a quota.'
    return
  }

  successMessage.value = 'Estado da quota atualizado com sucesso.'
  await loadQuotas()
}

const handleCreateQuotaForMember = async (memberId: string) => {
  submitError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  const result = await createQuotaForMember(
    memberId,
    currentYear,
    quotaAmount.value
  )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível criar a quota.'
    return
  }

  successMessage.value = `Quota de ${currentYear} criada com sucesso.`
  await loadQuotas()
}

const handleCreateMissingQuotas = async () => {
  submitError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  const result = await createMissingQuotas(
    currentYear,
    quotaAmount.value
  )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível gerar as quotas.'
    return
  }

  if (result.createdCount === 0) {
    successMessage.value = `Todos os sócios ativos já têm quota de ${currentYear}.`
  } else {
    successMessage.value = `${result.createdCount} quota(s) de ${currentYear} criada(s) com sucesso.`
  }

  await loadQuotas()
}

const handleExportQuotas = () => {
  const rows = filteredQuotas.value.map((quota) => {
    return {
      year: quota.year,
      memberNumber: `="${quota.memberNumber}"`,
      memberFullName: quota.memberFullName,
      memberEmail: quota.memberEmail,
      memberPhone: `="${quota.memberPhone}"`,
      memberStatus: getMemberStatusLabel(quota.memberStatus),
      amount: quota.amount,
      status: getQuotaLabel(quota.status),
      paidAt: quota.paidAt || '',
      createdAt: quota.createdAt
    }
  })

  exportRowsToCsv(
    `quotas-ccd-fiolhais-${currentYear}.csv`,
    [
      {
        key: 'year',
        label: 'Ano'
      },
      {
        key: 'memberNumber',
        label: 'Número de sócio'
      },
      {
        key: 'memberFullName',
        label: 'Nome'
      },
      {
        key: 'memberEmail',
        label: 'Email'
      },
      {
        key: 'memberPhone',
        label: 'Telefone'
      },
      {
        key: 'memberStatus',
        label: 'Estado do sócio'
      },
      {
        key: 'amount',
        label: 'Valor'
      },
      {
        key: 'status',
        label: 'Estado da quota'
      },
      {
        key: 'paidAt',
        label: 'Data de pagamento'
      },
      {
        key: 'createdAt',
        label: 'Criada em'
      }
    ],
    rows
  )
}

onMounted(async () => {
  await loadQuotas()
})
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
          Administração
        </p>

        <h1 class="mt-2 text-3xl font-bold text-gray-950">
          Quotas
        </h1>

        <p class="mt-2 text-gray-600">
          Gere as quotas reais dos sócios guardadas no Supabase.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-xl border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
          @click="handleReload"
        >
          Recarregar
        </button>

        <button
          type="button"
          class="rounded-xl border border-emerald-500 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          @click="handleExportQuotas"
        >
          Exportar CSV
        </button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <AdminStatCard
        :label="`Quotas ${currentYear}`"
        :value="totalCurrentYearQuotas"
        description="Criadas este ano"
      />

      <AdminStatCard
        label="Pagas"
        :value="paidCurrentYearQuotas"
        description="Quotas liquidadas"
      />

      <AdminStatCard
        label="Pendentes"
        :value="pendingCurrentYearQuotas"
        description="Ainda por pagar"
      />

      <AdminStatCard
        label="Em atraso"
        :value="overdueCurrentYearQuotas"
        description="Requerem atenção"
      />

      <AdminStatCard
        label="Valor recebido"
        :value="formatMoney(receivedAmount)"
        :description="`Referente a ${currentYear}`"
      />
    </div>

    <div
      v-if="submitError"
      class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
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
      class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
    >
      <p class="font-bold">
        Ação concluída
      </p>

      <p class="mt-2">
        {{ successMessage }}
      </p>
    </div>

    <div class="mt-8 rounded-3xl border border-amber-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 p-6">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-950">
              Gerar quotas anuais
            </h2>

            <p class="mt-2 text-gray-600">
              Existem {{ membersWithoutQuota.length }} sócio(s) ativo(s) sem quota de {{ currentYear }}.
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div>
              <label class="text-sm font-semibold text-gray-800">
                Valor da quota
              </label>

              <input
                v-model.number="quotaAmount"
                type="number"
                min="0"
                step="0.01"
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 sm:w-40"
              >
            </div>

            <button
              type="button"
              class="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
              @click="handleCreateMissingQuotas"
            >
              Gerar quotas {{ currentYear }}
            </button>
          </div>
        </div>

        <div
          v-if="membersWithoutQuota.length"
          class="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          <div
            v-for="member in membersWithoutQuota"
            :key="member.id"
            class="rounded-2xl border border-amber-200 bg-amber-50 p-4"
          >
            <p class="font-bold text-amber-950">
              Nº {{ member.number }} · {{ member.fullName }}
            </p>

            <p class="mt-1 text-sm text-amber-800">
              {{ member.email }} · {{ member.phone }}
            </p>

            <button
              type="button"
              class="mt-3 rounded-xl border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
              @click="handleCreateQuotaForMember(member.id)"
            >
              Criar quota individual
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 rounded-3xl border border-amber-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 p-6">
        <div class="grid gap-4 xl:grid-cols-[1fr_220px_220px]">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Pesquisar por sócio, número, email, telefone ou ano..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >

          <select
            v-model="selectedYear"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option
              v-for="year in yearOptions"
              :key="year.value"
              :value="year.value"
            >
              {{ year.label }}
            </option>
          </select>

          <select
            v-model="selectedStatus"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
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

      <div
        v-if="isLoading"
        class="p-8 text-center text-gray-600"
      >
        A carregar quotas...
      </div>

      <div
        v-else-if="filteredQuotas.length"
        class="overflow-x-auto"
      >
        <table class="w-full min-w-[1050px] text-left">
          <thead class="border-b border-gray-200 bg-gray-50 text-sm text-gray-500">
            <tr>
              <th class="px-6 py-4 font-semibold">
                Ano
              </th>

              <th class="px-6 py-4 font-semibold">
                Sócio
              </th>

              <th class="px-6 py-4 font-semibold">
                Contactos
              </th>

              <th class="px-6 py-4 font-semibold">
                Valor
              </th>

              <th class="px-6 py-4 font-semibold">
                Estado
              </th>

              <th class="px-6 py-4 font-semibold">
                Pagamento
              </th>

              <th class="px-6 py-4 font-semibold">
                Ações
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200 text-sm">
            <tr
              v-for="quota in filteredQuotas"
              :key="quota.id"
              class="align-top"
            >
              <td class="px-6 py-5 font-bold text-gray-950">
                {{ quota.year }}
              </td>

              <td class="px-6 py-5">
                <p class="font-bold text-gray-950">
                  Nº {{ quota.memberNumber }} · {{ quota.memberFullName }}
                </p>

                <p class="mt-1 text-gray-500">
                  Estado do sócio: {{ getMemberStatusLabel(quota.memberStatus) }}
                </p>

                <NuxtLink
                  :to="`/admin/socios/${quota.memberNumber}`"
                  class="mt-2 inline-block text-sm font-semibold text-amber-700 transition hover:text-amber-600"
                >
                  Ver sócio
                </NuxtLink>
              </td>

              <td class="px-6 py-5">
                <p class="break-all text-gray-950">
                  {{ quota.memberEmail }}
                </p>

                <p class="mt-1 text-gray-600">
                  {{ quota.memberPhone }}
                </p>
              </td>

              <td class="px-6 py-5 font-semibold text-gray-950">
                {{ formatMoney(quota.amount) }}
              </td>

              <td class="px-6 py-5">
                <span
                  class="rounded-full border px-3 py-1 text-xs font-bold"
                  :class="getQuotaClass(quota.status)"
                >
                  {{ getQuotaLabel(quota.status) }}
                </span>
              </td>

              <td class="px-6 py-5">
                <p class="text-gray-700">
                  {{ quota.paidAt ? `Paga em ${formatDate(quota.paidAt)}` : 'Sem pagamento registado' }}
                </p>
              </td>

              <td class="px-6 py-5">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-if="quota.status !== 'paid'"
                    type="button"
                    class="rounded-xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isSubmitting"
                    @click="handleUpdateQuotaStatus(quota.id, 'paid')"
                  >
                    Paga
                  </button>

                  <button
                    v-if="quota.status !== 'pending'"
                    type="button"
                    class="rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isSubmitting"
                    @click="handleUpdateQuotaStatus(quota.id, 'pending')"
                  >
                    Pendente
                  </button>

                  <button
                    v-if="quota.status !== 'overdue'"
                    type="button"
                    class="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isSubmitting"
                    @click="handleUpdateQuotaStatus(quota.id, 'overdue')"
                  >
                    Em atraso
                  </button>

                  <button
                    v-if="quota.status !== 'exempt'"
                    type="button"
                    class="rounded-xl border border-sky-300 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isSubmitting"
                    @click="handleUpdateQuotaStatus(quota.id, 'exempt')"
                  >
                    Isenta
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <SharedEmptyState
        v-else
        class="m-6"
        icon="💶"
        title="Nenhuma quota encontrada"
        description="Ainda não existem quotas reais no Supabase ou os filtros selecionados não têm resultados."
      />
    </div>
  </UContainer>
</template>