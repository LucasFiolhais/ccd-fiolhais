<script setup lang="ts">
import { useMemberSession } from '~/composables/useMemberSession'
import type { QuotaStatus } from '~/types/member'

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const { currentMember, isLoggedIn } = useMemberSession()

const quotas = computed(() => {
  if (!currentMember.value) {
    return []
  }

  return [...currentMember.value.quotas].sort((a, b) => b.year - a.year)
})

const getQuotaLabel = (status: QuotaStatus) => {
  if (status === 'paid') return 'Pago'
  if (status === 'pending') return 'Pendente'
  if (status === 'overdue') return 'Em atraso'
  if (status === 'exempt') return 'Isento'

  return 'Sem quota'
}

const getQuotaColor = (status: QuotaStatus): BadgeColor => {
  if (status === 'paid') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'overdue') return 'error'
  if (status === 'exempt') return 'info'

  return 'neutral'
}
</script>

<template>
  <UContainer class="py-12">
    <div class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">
        Área do Sócio
      </p>

      <h1 class="mt-2 text-4xl font-bold text-gray-950">
        As minhas quotas
      </h1>

      <p class="mt-3 text-gray-600">
        Consulta o histórico das tuas quotas anuais.
      </p>
    </div>

    <UCard v-if="!isLoggedIn">
      <h2 class="text-xl font-bold text-gray-950">
        Tens de entrar primeiro.
      </h2>

      <p class="mt-2 text-gray-600">
        Entra na área do sócio para consultar as tuas quotas.
      </p>

      <UButton
        to="/area-socio"
        class="mt-5"
      >
        Entrar na área do sócio
      </UButton>
    </UCard>

    <div
      v-else
      class="space-y-8"
    >
      <PublicMemberAreaNav />

      <UCard>
        <template #header>
          <h2 class="text-xl font-bold text-gray-950">
            Histórico de quotas
          </h2>
        </template>

        <div class="space-y-4">
          <div
            v-for="quota in quotas"
            :key="quota.year"
            class="rounded-xl border border-gray-200 p-4"
          >
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="font-semibold text-gray-950">
                  Quota {{ quota.year }}
                </p>

                <p class="mt-1 text-sm text-gray-600">
                  Valor: {{ quota.amount }}€
                </p>

                <p
                  v-if="quota.paidAt"
                  class="mt-1 text-sm text-gray-500"
                >
                  Pago em {{ quota.paidAt }}
                </p>
              </div>

              <UBadge
                :color="getQuotaColor(quota.status)"
                variant="soft"
              >
                {{ getQuotaLabel(quota.status) }}
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>