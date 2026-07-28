<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'
import { useMembers } from '~/composables/useMembers'

definePageMeta({
  layout: 'admin'
})

const {
  getMembers,
  getCurrentQuota
} = useMembers()

const {
  getEvents,
  registrations,
  getEventRegisteredCount,
  getEventPendingPaymentsCount
} = useEvents()

const currentYear = new Date().getFullYear()

const members = getMembers()
const events = getEvents()

const totalMembers = computed(() => {
  return members.length
})

const activeMembers = computed(() => {
  return members.filter((member) => member.status === 'active').length
})

const pendingMembers = computed(() => {
  return members.filter((member) => member.status === 'pending').length
})

const overdueQuotas = computed(() => {
  return members.filter((member) => {
    return getCurrentQuota(member, currentYear)?.status === 'overdue'
  }).length
})

const pendingQuotas = computed(() => {
  return members.filter((member) => {
    return getCurrentQuota(member, currentYear)?.status === 'pending'
  }).length
})

const paidQuotas = computed(() => {
  return members.filter((member) => {
    return getCurrentQuota(member, currentYear)?.status === 'paid'
  }).length
})

const totalEvents = computed(() => {
  return events.length
})

const openEvents = computed(() => {
  return events.filter((event) => event.status === 'open').length
})

const totalReservedSeats = computed(() => {
  return events.reduce((total, event) => {
    return total + getEventRegisteredCount(event.id)
  }, 0)
})

const pendingPayments = computed(() => {
  return events.reduce((total, event) => {
    return total + getEventPendingPaymentsCount(event.id)
  }, 0)
})

const totalEventRevenue = computed(() => {
  return registrations.value
    .filter((registration) => registration.paymentStatus === 'paid')
    .reduce((total, registration) => total + registration.totalAmount, 0)
})

const pendingEventRevenue = computed(() => {
  return registrations.value
    .filter((registration) => registration.paymentStatus === 'pending')
    .reduce((total, registration) => total + registration.totalAmount, 0)
})

const latestMembers = computed(() => {
  return [...members]
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
    .slice(0, 4)
})

const latestRegistrations = computed(() => {
  return [...registrations.value]
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .slice(0, 4)
})

const nextActions = computed(() => {
  const actions = []

  if (pendingMembers.value > 0) {
    actions.push(`${pendingMembers.value} pedido(s) de sócio por validar`)
  }

  if (pendingQuotas.value > 0 || overdueQuotas.value > 0) {
    actions.push(`${pendingQuotas.value + overdueQuotas.value} quota(s) pendentes ou em atraso`)
  }

  if (pendingPayments.value > 0) {
    actions.push(`${pendingPayments.value} pagamento(s) de eventos pendente(s)`)
  }

  if (openEvents.value > 0) {
    actions.push(`${openEvents.value} evento(s) com inscrições abertas`)
  }

  if (!actions.length) {
    actions.push('Não existem ações urgentes neste momento')
  }

  return actions
})

const getMemberStatusLabel = (status: string) => {
  if (status === 'active') return 'Ativo'
  if (status === 'pending') return 'Pendente'

  return 'Inativo'
}

const getMemberStatusColor = (status: string) => {
  if (status === 'active') return 'success'
  if (status === 'pending') return 'warning'

  return 'neutral'
}

const getPaymentLabel = (status: string) => {
  if (status === 'paid') return 'Pago'
  if (status === 'pending') return 'Pendente'

  return 'Cancelado'
}

const getPaymentColor = (status: string) => {
  if (status === 'paid') return 'success'
  if (status === 'pending') return 'warning'

  return 'neutral'
}
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">
          Dashboard
        </p>

        <h1 class="mt-2 text-3xl font-bold tracking-tight text-gray-950">
          Painel de administração
        </h1>

        <p class="mt-2 text-gray-600">
          Visão geral da atividade do CCD: sócios, quotas, eventos e inscrições.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          to="/admin/socios/novo"
          variant="outline"
        >
          Novo sócio
        </UButton>

        <UButton to="/admin/eventos/novo">
          Novo evento
        </UButton>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Sócios"
        :value="totalMembers"
        :description="`${activeMembers} ativos · ${pendingMembers} pendentes`"
      />

      <AdminStatCard
        label="Quotas pagas"
        :value="paidQuotas"
        :description="`Ano ${currentYear}`"
      />

      <AdminStatCard
        label="Eventos"
        :value="totalEvents"
        :description="`${openEvents} com inscrições abertas`"
      />

      <AdminStatCard
        label="Lugares reservados"
        :value="totalReservedSeats"
        description="Total de lugares em eventos"
      />
    </div>

    <div class="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Quotas pendentes"
        :value="pendingQuotas + overdueQuotas"
        :description="`${overdueQuotas} em atraso`"
      />

      <AdminStatCard
        label="Pagamentos pendentes"
        :value="pendingPayments"
        description="Inscrições ainda por pagar"
      />

      <AdminStatCard
        label="Receita recebida"
        :value="`${totalEventRevenue}€`"
        description="Inscrições pagas"
      />

      <AdminStatCard
        label="Receita pendente"
        :value="`${pendingEventRevenue}€`"
        description="Inscrições por pagar"
      />
    </div>

    <div class="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-gray-950">
                Ações recomendadas
              </h2>

              <p class="mt-1 text-sm text-gray-600">
                Tarefas que a direção deve acompanhar.
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="action in nextActions"
            :key="action"
            class="rounded-xl border border-gray-200 p-4 text-sm text-gray-700"
          >
            {{ action }}
          </div>
        </div>

        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UButton
              to="/admin/socios"
              variant="outline"
            >
              Ver sócios
            </UButton>

            <UButton
              to="/admin/quotas"
              variant="outline"
            >
              Ver quotas
            </UButton>

            <UButton to="/admin/eventos">
              Ver eventos
            </UButton>
          </div>
        </template>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-bold text-gray-950">
            Resumo financeiro dos eventos
          </h2>
        </template>

        <div class="space-y-4">
          <div class="rounded-xl bg-gray-50 p-4">
            <p class="text-sm text-gray-500">
              Receita confirmada
            </p>

            <p class="mt-2 text-3xl font-bold text-gray-950">
              {{ totalEventRevenue }}€
            </p>
          </div>

          <div class="rounded-xl bg-gray-50 p-4">
            <p class="text-sm text-gray-500">
              Receita ainda pendente
            </p>

            <p class="mt-2 text-3xl font-bold text-gray-950">
              {{ pendingEventRevenue }}€
            </p>
          </div>

          <div class="rounded-xl bg-gray-50 p-4">
            <p class="text-sm text-gray-500">
              Total potencial
            </p>

            <p class="mt-2 text-3xl font-bold text-gray-950">
              {{ totalEventRevenue + pendingEventRevenue }}€
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <div class="mt-8 grid gap-6 lg:grid-cols-2">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-bold text-gray-950">
              Últimos sócios
            </h2>

            <UButton
              to="/admin/socios"
              variant="link"
            >
              Ver todos
            </UButton>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="member in latestMembers"
            :key="member.id"
            class="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4"
          >
            <div>
              <p class="font-medium text-gray-950">
                {{ member.fullName }}
              </p>

              <p class="text-sm text-gray-500">
                Nº {{ member.number }} · {{ member.joinedAt }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <UBadge
                :color="getMemberStatusColor(member.status)"
                variant="soft"
              >
                {{ getMemberStatusLabel(member.status) }}
              </UBadge>

              <UButton
                :to="`/admin/socios/${member.number}`"
                size="sm"
                variant="outline"
              >
                Ver
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-bold text-gray-950">
              Últimas inscrições
            </h2>

            <UButton
              to="/admin/eventos"
              variant="link"
            >
              Ver eventos
            </UButton>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="registration in latestRegistrations"
            :key="registration.id"
            class="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4"
          >
            <div>
              <p class="font-medium text-gray-950">
                {{ registration.name }}
              </p>

              <p class="text-sm text-gray-500">
                {{ registration.quantity }} lugar(es) · {{ registration.totalAmount }}€
              </p>
            </div>

            <UBadge
              :color="getPaymentColor(registration.paymentStatus)"
              variant="soft"
            >
              {{ getPaymentLabel(registration.paymentStatus) }}
            </UBadge>
          </div>

          <div
            v-if="!latestRegistrations.length"
            class="py-8 text-center text-sm text-gray-500"
          >
            Ainda não existem inscrições.
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>