<script setup lang="ts">
import { exportRowsToCsv } from '~/utils/exportCsv'
import {
  useSupabaseAdminMembers,
  type AdminMember,
  type AdminMemberStatus,
  type AdminQuotaStatus
} from '~/composables/useSupabaseAdminMembers'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Sócios'
})

type StatusFilter = 'all' | AdminMemberStatus
type QuotaFilter = 'all' | AdminQuotaStatus | 'none'

const currentYear = new Date().getFullYear()

const {
  getMembers,
  updateMemberStatus,
  updateQuotaStatus,
  createCurrentYearQuota
} = useSupabaseAdminMembers()

const members = ref<AdminMember[]>([])
const searchTerm = ref('')
const selectedStatus = ref<StatusFilter>('all')
const selectedQuota = ref<QuotaFilter>('all')
const isLoading = ref(true)
const submitError = ref('')
const successMessage = ref('')

const statusOptions: Array<{
  label: string
  value: StatusFilter
}> = [
  {
    label: 'Todos',
    value: 'all'
  },
  {
    label: 'Ativos',
    value: 'active'
  },
  {
    label: 'Pendentes',
    value: 'pending'
  },
  {
    label: 'Inativos',
    value: 'inactive'
  }
]

const quotaOptions: Array<{
  label: string
  value: QuotaFilter
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
  },
  {
    label: 'Sem quota',
    value: 'none'
  }
]

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

const getQuotaLabel = (status?: AdminQuotaStatus) => {
  if (status === 'paid') {
    return 'Paga'
  }

  if (status === 'pending') {
    return 'Pendente'
  }

  if (status === 'overdue') {
    return 'Em atraso'
  }

  if (status === 'exempt') {
    return 'Isenta'
  }

  return 'Sem quota'
}

const getQuotaClass = (status?: AdminQuotaStatus) => {
  if (status === 'paid') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'pending') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  if (status === 'overdue') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  if (status === 'exempt') {
    return 'border-sky-200 bg-sky-50 text-sky-700'
  }

  return 'border-gray-200 bg-gray-50 text-gray-600'
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

const totalMembers = computed(() => {
  return members.value.length
})

const activeMembers = computed(() => {
  return members.value.filter((member) => member.status === 'active').length
})

const pendingMembers = computed(() => {
  return members.value.filter((member) => member.status === 'pending').length
})

const overdueQuotas = computed(() => {
  return members.value.filter((member) => {
    return member.currentQuota?.status === 'overdue'
  }).length
})

const filteredMembers = computed(() => {
  return members.value.filter((member) => {
    const searchValue = searchTerm.value.toLowerCase()

    const matchesSearch = [
      member.number,
      member.fullName,
      member.email,
      member.phone,
      member.address,
      member.notes || ''
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchValue)

    const matchesStatus =
      selectedStatus.value === 'all' ||
      member.status === selectedStatus.value

    const matchesQuota =
      selectedQuota.value === 'all' ||
      (
        selectedQuota.value === 'none' &&
        !member.currentQuota
      ) ||
      member.currentQuota?.status === selectedQuota.value

    return matchesSearch && matchesStatus && matchesQuota
  })
})

const loadMembers = async () => {
  isLoading.value = true
  submitError.value = ''
  successMessage.value = ''

  const result = await getMembers()

  isLoading.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível carregar os sócios.'
    return
  }

  members.value = result.members
}

const handleReload = async () => {
  await loadMembers()
}

const handleActivateMember = async (memberId: string) => {
  submitError.value = ''
  successMessage.value = ''

  const result = await updateMemberStatus(memberId, 'active')

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível ativar o sócio.'
    return
  }

  successMessage.value = 'Sócio ativado com sucesso.'
  await loadMembers()
}

const handleDeactivateMember = async (memberId: string) => {
  submitError.value = ''
  successMessage.value = ''

  const result = await updateMemberStatus(memberId, 'inactive')

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível desativar o sócio.'
    return
  }

  successMessage.value = 'Sócio desativado com sucesso.'
  await loadMembers()
}

const handleMarkQuotaAsPaid = async (quotaId: string) => {
  submitError.value = ''
  successMessage.value = ''

  const result = await updateQuotaStatus(quotaId, 'paid')

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível marcar a quota como paga.'
    return
  }

  successMessage.value = 'Quota marcada como paga.'
  await loadMembers()
}

const handleMarkQuotaAsOverdue = async (quotaId: string) => {
  submitError.value = ''
  successMessage.value = ''

  const result = await updateQuotaStatus(quotaId, 'overdue')

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível marcar a quota como em atraso.'
    return
  }

  successMessage.value = 'Quota marcada como em atraso.'
  await loadMembers()
}

const handleCreateCurrentQuota = async (memberId: string) => {
  submitError.value = ''
  successMessage.value = ''

  const result = await createCurrentYearQuota(memberId)

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível criar a quota do ano atual.'
    return
  }

  successMessage.value = `Quota de ${currentYear} criada com sucesso.`
  await loadMembers()
}

const handleExportMembers = () => {
  const rows = filteredMembers.value.map((member) => {
    return {
      number: `="${member.number}"`,
      fullName: member.fullName,
      email: member.email,
      phone: `="${member.phone}"`,
      address: member.address,
      birthDate: member.birthDate || '',
      joinedAt: member.joinedAt,
      status: getStatusLabel(member.status),
      quotaYear: member.currentQuota?.year || '',
      quotaAmount: member.currentQuota?.amount || '',
      quotaStatus: getQuotaLabel(member.currentQuota?.status),
      paidAt: member.currentQuota?.paidAt || '',
      notes: member.notes || ''
    }
  })

  exportRowsToCsv(
    `socios-supabase-ccd-fiolhais-${currentYear}.csv`,
    [
      {
        key: 'number',
        label: 'Número'
      },
      {
        key: 'fullName',
        label: 'Nome'
      },
      {
        key: 'email',
        label: 'Email'
      },
      {
        key: 'phone',
        label: 'Telefone'
      },
      {
        key: 'address',
        label: 'Morada'
      },
      {
        key: 'birthDate',
        label: 'Data de nascimento'
      },
      {
        key: 'joinedAt',
        label: 'Data de inscrição'
      },
      {
        key: 'status',
        label: 'Estado'
      },
      {
        key: 'quotaYear',
        label: 'Ano da quota'
      },
      {
        key: 'quotaAmount',
        label: 'Valor da quota'
      },
      {
        key: 'quotaStatus',
        label: 'Estado da quota'
      },
      {
        key: 'paidAt',
        label: 'Data de pagamento'
      },
      {
        key: 'notes',
        label: 'Observações'
      }
    ],
    rows
  )
}

onMounted(async () => {
  await loadMembers()
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
          Sócios
        </h1>

        <p class="mt-2 text-gray-600">
          Consulta os sócios reais guardados na base de dados Supabase.
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
          @click="handleExportMembers"
        >
          Exportar CSV
        </button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Total"
        :value="totalMembers"
        description="Sócios registados"
      />

      <AdminStatCard
        label="Ativos"
        :value="activeMembers"
        description="Sócios ativos"
      />

      <AdminStatCard
        label="Pendentes"
        :value="pendingMembers"
        description="Ainda por validar"
      />

      <AdminStatCard
        label="Quotas em atraso"
        :value="overdueQuotas"
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
        <div class="grid gap-4 xl:grid-cols-[1fr_220px_220px]">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Pesquisar por número, nome, email, telefone ou morada..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >

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

          <select
            v-model="selectedQuota"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option
              v-for="quota in quotaOptions"
              :key="quota.value"
              :value="quota.value"
            >
              {{ quota.label }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="p-8 text-center text-gray-600"
      >
        A carregar sócios...
      </div>

      <div
        v-else-if="filteredMembers.length"
        class="overflow-x-auto"
      >
        <table class="w-full min-w-[1050px] text-left">
          <thead class="border-b border-gray-200 bg-gray-50 text-sm text-gray-500">
            <tr>
              <th class="px-6 py-4 font-semibold">
                Nº
              </th>

              <th class="px-6 py-4 font-semibold">
                Sócio
              </th>

              <th class="px-6 py-4 font-semibold">
                Contactos
              </th>

              <th class="px-6 py-4 font-semibold">
                Estado
              </th>

              <th class="px-6 py-4 font-semibold">
                Quota {{ currentYear }}
              </th>

              <th class="px-6 py-4 font-semibold">
                Ações
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200 text-sm">
            <tr
              v-for="member in filteredMembers"
              :key="member.id"
              class="align-top"
            >
              <td class="px-6 py-5 font-bold text-gray-950">
                {{ member.number }}
              </td>

              <td class="px-6 py-5">
                <p class="font-bold text-gray-950">
                  {{ member.fullName }}
                </p>

                <p class="mt-1 text-gray-500">
                  Inscrito em {{ formatDate(member.joinedAt) }}
                </p>

                <p class="mt-1 text-gray-500">
                  Nascimento: {{ formatDate(member.birthDate) }}
                </p>

                <p
                  v-if="member.notes"
                  class="mt-2 max-w-sm text-gray-600"
                >
                  {{ member.notes }}
                </p>
              </td>

              <td class="px-6 py-5">
                <p class="break-all text-gray-950">
                  {{ member.email }}
                </p>

                <p class="mt-1 text-gray-600">
                  {{ member.phone }}
                </p>

                <p class="mt-1 max-w-xs text-gray-500">
                  {{ member.address }}
                </p>
              </td>

              <td class="px-6 py-5">
                <span
                  class="rounded-full border px-3 py-1 text-xs font-bold"
                  :class="getStatusClass(member.status)"
                >
                  {{ getStatusLabel(member.status) }}
                </span>
              </td>

              <td class="px-6 py-5">
                <div v-if="member.currentQuota">
                  <span
                    class="rounded-full border px-3 py-1 text-xs font-bold"
                    :class="getQuotaClass(member.currentQuota.status)"
                  >
                    {{ getQuotaLabel(member.currentQuota.status) }}
                  </span>

                  <p class="mt-2 text-gray-600">
                    {{ formatMoney(member.currentQuota.amount) }}
                  </p>

                  <p
                    v-if="member.currentQuota.paidAt"
                    class="mt-1 text-gray-500"
                  >
                    Paga em {{ formatDate(member.currentQuota.paidAt) }}
                  </p>
                </div>

                <div v-else>
                  <span
                    class="rounded-full border px-3 py-1 text-xs font-bold"
                    :class="getQuotaClass()"
                  >
                    Sem quota
                  </span>
                </div>
              </td>

              <td class="px-6 py-5">
                <div class="flex flex-wrap gap-2">

                  <NuxtLink
  :to="`/admin/socios/${member.number}`"
  class="rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
>
  Ver detalhes
</NuxtLink>

<NuxtLink
  :to="`/admin/socios/${member.number}/editar`"
  class="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
>
  Editar
</NuxtLink>

                  <button
                    v-if="member.status !== 'active'"
                    type="button"
                    class="rounded-xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    @click="handleActivateMember(member.id)"
                  >
                    Ativar
                  </button>

                  <button
                    v-if="member.status !== 'inactive'"
                    type="button"
                    class="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                    @click="handleDeactivateMember(member.id)"
                  >
                    Desativar
                  </button>

                  <button
                    v-if="member.currentQuota && member.currentQuota.status !== 'paid'"
                    type="button"
                    class="rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                    @click="handleMarkQuotaAsPaid(member.currentQuota.id)"
                  >
                    Marcar quota paga
                  </button>

                  <button
                    v-if="member.currentQuota && member.currentQuota.status !== 'overdue'"
                    type="button"
                    class="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    @click="handleMarkQuotaAsOverdue(member.currentQuota.id)"
                  >
                    Marcar em atraso
                  </button>

                  <button
                    v-if="!member.currentQuota"
                    type="button"
                    class="rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                    @click="handleCreateCurrentQuota(member.id)"
                  >
                    Criar quota {{ currentYear }}
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
        icon="👥"
        title="Nenhum sócio encontrado"
        description="Ainda não existem sócios reais no Supabase ou os filtros selecionados não têm resultados."
      />
    </div>
  </UContainer>
</template>