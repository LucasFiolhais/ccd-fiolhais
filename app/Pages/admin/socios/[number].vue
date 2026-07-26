<script setup lang="ts">
import { useMembers } from '~/composables/useMembers'
import type { MemberStatus, QuotaStatus } from '~/types/member'

definePageMeta({
  layout: 'admin'
})

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const route = useRoute()
const { getMemberByNumber, markQuotaAsPaid } = useMembers()

const member = computed(() => {
  return getMemberByNumber(String(route.params.number))
})

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

const handleMarkQuotaAsPaid = (year: number) => {
  if (!member.value) {
    return
  }

  markQuotaAsPaid(member.value.number, year)
}
</script>

<template>
  <UContainer class="py-10">
    <UButton
      to="/admin/socios"
      variant="link"
      class="mb-6 px-0"
    >
      ← Voltar aos sócios
    </UButton>

    <div
      v-if="member"
      class="grid gap-8 lg:grid-cols-[1fr_0.9fr]"
    >
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p class="text-sm font-semibold uppercase tracking-wide text-primary">
                  Sócio nº {{ member.number }}
                </p>

                <h1 class="mt-2 text-3xl font-bold text-gray-950">
                  {{ member.fullName }}
                </h1>

                <p class="mt-2 text-gray-600">
                  Ficha digital do sócio.
                </p>
              </div>

              <UBadge
                :color="getStatusColor(member.status)"
                variant="soft"
              >
                {{ getStatusLabel(member.status) }}
              </UBadge>
            </div>
          </template>

          <div class="grid gap-4 text-sm md:grid-cols-2">
            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-gray-500">
                Email
              </p>

              <p class="mt-1 font-medium text-gray-950">
                {{ member.email }}
              </p>
            </div>

            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-gray-500">
                Telefone
              </p>

              <p class="mt-1 font-medium text-gray-950">
                {{ member.phone }}
              </p>
            </div>

            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-gray-500">
                Morada
              </p>

              <p class="mt-1 font-medium text-gray-950">
                {{ member.address }}
              </p>
            </div>

            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-gray-500">
                Data de inscrição
              </p>

              <p class="mt-1 font-medium text-gray-950">
                {{ member.joinedAt }}
              </p>
            </div>

            <div
              v-if="member.birthDate"
              class="rounded-xl bg-gray-50 p-4"
            >
              <p class="text-gray-500">
                Data de nascimento
              </p>

              <p class="mt-1 font-medium text-gray-950">
                {{ member.birthDate }}
              </p>
            </div>
          </div>

          <div
            v-if="member.notes"
            class="mt-6 rounded-xl border border-gray-200 p-4"
          >
            <p class="text-sm font-medium text-gray-950">
              Notas internas
            </p>

            <p class="mt-2 text-sm text-gray-600">
              {{ member.notes }}
            </p>
          </div>

          <template #footer>
            <div class="flex flex-wrap gap-2">
              <UButton>
                Editar dados
              </UButton>

              <UButton variant="outline">
                Enviar email
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Histórico de quotas
            </h2>
          </template>

          <div class="space-y-4">
            <div
  v-for="quota in member.quotas"
  :key="quota.year"
  class="rounded-xl border border-gray-200 p-4"
>
  <div class="flex items-start justify-between gap-4">
    <div>
      <p class="font-semibold text-gray-950">
        Quota {{ quota.year }}
      </p>

      <p class="mt-1 text-sm text-gray-500">
        Valor: {{ quota.amount }}€
      </p>

      <p
        v-if="quota.paidAt"
        class="mt-1 text-xs text-gray-500"
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

  <UButton
    v-if="quota.status !== 'paid'"
    class="mt-4"
    size="sm"
    variant="outline"
    @click="handleMarkQuotaAsPaid(quota.year)"
  >
    Marcar como paga
  </UButton>
</div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Próximas ações
            </h2>
          </template>

          <div class="space-y-3 text-sm text-gray-600">
            <p>
              Mais tarde esta ficha vai permitir editar dados, consultar inscrições
              em eventos e guardar alterações na base de dados.
            </p>

            <p>
              O botão “Marcar como paga” por enquanto altera apenas o estado localmente,
              sem guardar no Supabase.
            </p>
          </div>
        </UCard>
      </div>
    </div>

    <UCard
      v-else
      class="text-center"
    >
      <h1 class="text-2xl font-bold text-gray-950">
        Sócio não encontrado
      </h1>

      <p class="mt-2 text-gray-600">
        O número de sócio indicado não existe.
      </p>

      <UButton
        to="/admin/socios"
        class="mt-6"
      >
        Voltar à lista
      </UButton>
    </UCard>
  </UContainer>
</template>