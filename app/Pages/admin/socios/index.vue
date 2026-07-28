<script setup lang="ts">
import { useMembers } from '~/composables/useMembers'
import type { MemberStatus, QuotaStatus } from '~/types/member'

definePageMeta({
  layout: 'admin'
})

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const { getMembers, getCurrentQuota } = useMembers()

const search = ref('')
const selectedStatus = ref('Todos')
const selectedQuota = ref('Todas')

const members = getMembers()

const statusOptions = ['Todos', 'Ativo', 'Pendente', 'Inativo']
const quotaOptions = ['Todas', 'Pago', 'Pendente', 'Em atraso', 'Isento']

const getStatusLabel = (status: MemberStatus) => {
  if (status === 'active') return 'Ativo'
  if (status === 'pending') return 'Pendente'

  return 'Inativo'
}

const getStatusColor = (status: MemberStatus): BadgeColor => {
  if (status === 'active') return 'success'
  if (status === 'pending') return 'warning'

  return 'neutral'
}

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

const filteredMembers = computed(() => {
  return members.filter((member) => {
    const currentQuota = getCurrentQuota(member)

    const matchesSearch =
      member.fullName.toLowerCase().includes(search.value.toLowerCase()) ||
      member.email.toLowerCase().includes(search.value.toLowerCase()) ||
      member.number.includes(search.value)

    const matchesStatus =
      selectedStatus.value === 'Todos' ||
      getStatusLabel(member.status) === selectedStatus.value

    const matchesQuota =
      selectedQuota.value === 'Todas' ||
      getQuotaLabel(currentQuota?.status) === selectedQuota.value

    return matchesSearch && matchesStatus && matchesQuota
  })
})

const totalMembers = computed(() => members.length)

const activeMembers = computed(() => {
  return members.filter((member) => member.status === 'active').length
})

const overdueMembers = computed(() => {
  return members.filter((member) => getCurrentQuota(member)?.status === 'overdue').length
})
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">
          Sócios
        </p>

        <h1 class="mt-2 text-3xl font-bold text-gray-950">
          Gestão de sócios
        </h1>

        <p class="mt-2 text-gray-600">
          Pesquisa, consulta e acompanhamento dos sócios do CCD.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton variant="outline">
          Exportar Excel
        </UButton>

<UButton to="/admin/socios/novo">
  Novo sócio
</UButton>
      </div>
    </div>

    <div class="mb-8 grid gap-6 md:grid-cols-3">
      <AdminStatCard
        label="Total de sócios"
        :value="totalMembers"
        description="Sócios registados no sistema"
      />

      <AdminStatCard
        label="Sócios ativos"
        :value="activeMembers"
        description="Sócios com estado ativo"
      />

      <AdminStatCard
        label="Quotas em atraso"
        :value="overdueMembers"
        description="Sócios com quota anual em atraso"
      />
    </div>

    <UCard>
      <div class="mb-6 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
        <UInput
          v-model="search"
          placeholder="Pesquisar por nome, email ou número..."
          size="lg"
        />

        <USelect
          v-model="selectedStatus"
          :items="statusOptions"
          size="lg"
        />

        <USelect
          v-model="selectedQuota"
          :items="quotaOptions"
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
                Nome
              </th>

              <th class="px-4 py-3 font-medium">
                Contacto
              </th>

              <th class="px-4 py-3 font-medium">
                Estado
              </th>

              <th class="px-4 py-3 font-medium">
                Quota {{ new Date().getFullYear() }}
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
                  Inscrito em {{ member.joinedAt }}
                </p>
              </td>

              <td class="px-4 py-4 text-gray-700">
                <p>{{ member.email }}</p>
                <p class="text-xs text-gray-500">{{ member.phone }}</p>
              </td>

              <td class="px-4 py-4">
                <UBadge
                  :color="getStatusColor(member.status)"
                  variant="soft"
                >
                  {{ getStatusLabel(member.status) }}
                </UBadge>
              </td>

              <td class="px-4 py-4">
                <UBadge
                  :color="getQuotaColor(getCurrentQuota(member)?.status)"
                  variant="soft"
                >
                  {{ getQuotaLabel(getCurrentQuota(member)?.status) }}
                </UBadge>
              </td>

              <td class="px-4 py-4 text-right">
                <UButton
                  :to="`/admin/socios/${member.number}`"
                  variant="outline"
                  size="sm"
                >
                  Ver ficha
                </UButton>
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
          Tenta alterar a pesquisa ou os filtros.
        </p>
      </div>
    </UCard>
  </UContainer>
</template>