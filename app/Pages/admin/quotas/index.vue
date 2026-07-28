<script setup lang="ts">
import { useMembers } from '~/composables/useMembers'
import type { MemberItem, QuotaStatus } from '~/types/member'

definePageMeta({
  layout: 'admin'
})

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const {
  getMembers,
  getCurrentQuota,
  markQuotaAsPaid,
  generateAnnualQuotas
} = useMembers()

const currentYear = new Date().getFullYear()

const members = getMembers()

const selectedYear = ref(String(currentYear))
const selectedQuotaStatus = ref('Todas')
const search = ref('')

const quotaStatusOptions = [
  'Todas',
  'Pago',
  'Pendente',
  'Em atraso',
  'Isento',
  'Sem quota'
]

const yearOptions = computed(() => {
  const years = new Set<number>()

  members.forEach((member) => {
    member.quotas.forEach((quota) => {
      years.add(quota.year)
    })
  })

  years.add(currentYear)

  return [...years]
    .sort((a, b) => b - a)
    .map(String)
})

const selectedYearNumber = computed(() => {
  return Number(selectedYear.value)
})

const getQuotaLabel = (status?: QuotaStatus) => {
  if (status === 'paid') return 'Pago'
  if (status === 'pending') return 'Pendente'
  if (status === 'overdue') return 'Em atraso'
  if (status === 'exempt') return 'Isento'

  return 'Sem quota'
}

const getQuotaColor = (status?: QuotaStatus): BadgeColor => {
  if (status === 'paid') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'overdue') return 'error'
  if (status === 'exempt') return 'info'

  return 'neutral'
}

const getMemberQuota = (member: MemberItem) => {
  return getCurrentQuota(member, selectedYearNumber.value)
}

const filteredMembers = computed(() => {
  return members.filter((member) => {
    const quota = getMemberQuota(member)

    const matchesSearch =
      member.fullName.toLowerCase().includes(search.value.toLowerCase()) ||
      member.email.toLowerCase().includes(search.value.toLowerCase()) ||
      member.number.includes(search.value)

    const matchesQuotaStatus =
      selectedQuotaStatus.value === 'Todas' ||
      getQuotaLabel(quota?.status) === selectedQuotaStatus.value

    return matchesSearch && matchesQuotaStatus
  })
})

const totalMembers = computed(() => {
  return members.length
})

const paidCount = computed(() => {
  return members.filter((member) => {
    return getMemberQuota(member)?.status === 'paid'
  }).length
})

const pendingCount = computed(() => {
  return members.filter((member) => {
    return getMemberQuota(member)?.status === 'pending'
  }).length
})

const overdueCount = computed(() => {
  return members.filter((member) => {
    return getMemberQuota(member)?.status === 'overdue'
  }).length
})

const missingQuotaCount = computed(() => {
  return members.filter((member) => {
    return !getMemberQuota(member)
  }).length
})

const totalExpectedAmount = computed(() => {
  return members.reduce((total, member) => {
    const quota = getMemberQuota(member)

    if (!quota || quota.status === 'exempt') {
      return total
    }

    return total + quota.amount
  }, 0)
})

const totalPaidAmount = computed(() => {
  return members.reduce((total, member) => {
    const quota = getMemberQuota(member)

    if (!quota || quota.status !== 'paid') {
      return total
    }

    return total + quota.amount
  }, 0)
})

const handleMarkQuotaAsPaid = (memberNumber: string) => {
  markQuotaAsPaid(memberNumber, selectedYearNumber.value)
}

const handleGenerateQuotas = () => {
  generateAnnualQuotas(selectedYearNumber.value)
}
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">
          Quotas
        </p>

        <h1 class="mt-2 text-3xl font-bold text-gray-950">
          Gestão de quotas
        </h1>

        <p class="mt-2 text-gray-600">
          Acompanha o estado das quotas anuais dos sócios e marca pagamentos manualmente.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          variant="outline"
          @click="handleGenerateQuotas"
        >
          Gerar quotas {{ selectedYear }}
        </UButton>

        <UButton variant="soft">
          Exportar relatório
        </UButton>
      </div>
    </div>

    <div class="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Total de sócios"
        :value="totalMembers"
        :description="`Ano ${selectedYear}`"
      />

      <AdminStatCard
        label="Quotas pagas"
        :value="paidCount"
        description="Sócios com quota paga"
      />

      <AdminStatCard
        label="Pendentes"
        :value="pendingCount + overdueCount"
        description="Quotas pendentes ou em atraso"
      />

      <AdminStatCard
        label="Valor recebido"
        :value="`${totalPaidAmount}€`"
        :description="`Previsto: ${totalExpectedAmount}€`"
      />
    </div>

    <UCard class="mb-8">
      <div class="grid gap-4 md:grid-cols-4">
        <div class="rounded-xl bg-gray-50 p-4">
          <p class="text-sm text-gray-500">
            Pagas
          </p>

          <p class="mt-2 text-2xl font-bold text-gray-950">
            {{ paidCount }}
          </p>
        </div>

        <div class="rounded-xl bg-gray-50 p-4">
          <p class="text-sm text-gray-500">
            Pendentes
          </p>

          <p class="mt-2 text-2xl font-bold text-gray-950">
            {{ pendingCount }}
          </p>
        </div>

        <div class="rounded-xl bg-gray-50 p-4">
          <p class="text-sm text-gray-500">
            Em atraso
          </p>

          <p class="mt-2 text-2xl font-bold text-gray-950">
            {{ overdueCount }}
          </p>
        </div>

        <div class="rounded-xl bg-gray-50 p-4">
          <p class="text-sm text-gray-500">
            Sem quota
          </p>

          <p class="mt-2 text-2xl font-bold text-gray-950">
            {{ missingQuotaCount }}
          </p>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="mb-6 grid gap-4 lg:grid-cols-[180px_220px_1fr]">
        <USelect
          v-model="selectedYear"
          :items="yearOptions"
          size="lg"
        />

        <USelect
          v-model="selectedQuotaStatus"
          :items="quotaStatusOptions"
          size="lg"
        />

        <UInput
          v-model="search"
          placeholder="Pesquisar por nome, email ou número..."
          size="lg"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="px-4 py-3 font-medium">
                Nº
              </th>

              <th class="px-4 py-3 font-medium">
                Sócio
              </th>

              <th class="px-4 py-3 font-medium">
                Quota
              </th>

              <th class="px-4 py-3 font-medium">
                Valor
              </th>

              <th class="px-4 py-3 font-medium">
                Pagamento
              </th>

              <th class="px-4 py-3 text-right font-medium">
                Ações
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="member in filteredMembers"
              :key="member.id"
            >
              <td class="px-4 py-4 font-medium text-gray-950">
                {{ member.number }}
              </td>

              <td class="px-4 py-4">
                <p class="font-medium text-gray-950">
                  {{ member.fullName }}
                </p>

                <p class="text-xs text-gray-500">
                  {{ member.email }}
                </p>
              </td>

              <td class="px-4 py-4">
                <UBadge
                  :color="getQuotaColor(getMemberQuota(member)?.status)"
                  variant="soft"
                >
                  {{ getQuotaLabel(getMemberQuota(member)?.status) }}
                </UBadge>
              </td>

              <td class="px-4 py-4 text-gray-700">
                <span v-if="getMemberQuota(member)">
                  {{ getMemberQuota(member)?.amount }}€
                </span>

                <span
                  v-else
                  class="text-gray-400"
                >
                  —
                </span>
              </td>

              <td class="px-4 py-4 text-gray-700">
                <span v-if="getMemberQuota(member)?.paidAt">
                  {{ getMemberQuota(member)?.paidAt }}
                </span>

                <span
                  v-else
                  class="text-gray-400"
                >
                  Ainda não pago
                </span>
              </td>

              <td class="px-4 py-4">
                <div class="flex justify-end gap-2">
                  <UButton
                    :to="`/admin/socios/${member.number}`"
                    size="sm"
                    variant="outline"
                  >
                    Ver ficha
                  </UButton>

                  <UButton
                    v-if="getMemberQuota(member) && getMemberQuota(member)?.status !== 'paid'"
                    size="sm"
                    @click="handleMarkQuotaAsPaid(member.number)"
                  >
                    Marcar paga
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!filteredMembers.length"
        class="py-10 text-center"
      >
        <p class="font-medium text-gray-950">
          Nenhum sócio encontrado.
        </p>

        <p class="mt-1 text-sm text-gray-500">
          Tenta alterar os filtros ou a pesquisa.
        </p>
      </div>
    </UCard>
  </UContainer>
</template>