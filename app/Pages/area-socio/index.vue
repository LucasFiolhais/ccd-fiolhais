<script setup lang="ts">
import { useMembers } from '~/composables/useMembers'
import { useMemberSession } from '~/composables/useMemberSession'
import type { MemberStatus, QuotaStatus } from '~/types/member'

const { getMembers, getCurrentQuota } = useMembers()
const { currentMember, isLoggedIn, loginAsMember } = useMemberSession()

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const members = getMembers()
const currentYear = new Date().getFullYear()

const selectedMemberNumber = ref(members[0]?.number || '')
const loginError = ref('')

const memberOptions = computed(() => {
  return members.map((member) => ({
    label: `${member.number} - ${member.fullName}`,
    value: member.number
  }))
})

const currentQuota = computed(() => {
  if (!currentMember.value) {
    return null
  }

  return getCurrentQuota(currentMember.value, currentYear) || null
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

const handleLogin = () => {
  loginError.value = ''

  const success = loginAsMember(selectedMemberNumber.value)

  if (!success) {
    loginError.value = 'Não foi encontrado nenhum sócio com esse número.'
  }
}
</script>

<template>
  <UContainer class="py-12">
    <div class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">
        Área do Sócio
      </p>

      <h1 class="mt-2 text-4xl font-bold text-gray-950">
        Portal do sócio
      </h1>

      <p class="mt-3 text-gray-600">
        Consulta os teus dados, quotas e inscrições em eventos.
      </p>
    </div>

    <UCard v-if="!isLoggedIn">
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-gray-950">
            Entrar como sócio
          </h2>

          <p class="mt-1 text-sm text-gray-600">
            Nesta fase ainda não existe login real. Escolhe um sócio para simular o acesso.
          </p>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-[1fr_auto]">
        <USelect
          v-model="selectedMemberNumber"
          :items="memberOptions"
          size="lg"
        />

        <UButton
          size="lg"
          @click="handleLogin"
        >
          Entrar
        </UButton>
      </div>

      <p
        v-if="loginError"
        class="mt-3 text-sm text-red-600"
      >
        {{ loginError }}
      </p>
    </UCard>

    <div
      v-else-if="currentMember"
      class="space-y-8"
    >
      <PublicMemberAreaNav />

      <div class="grid gap-6 md:grid-cols-3">
        <AdminStatCard
          label="Número de sócio"
          :value="currentMember.number"
          description="Identificação interna"
        />

        <AdminStatCard
          label="Estado"
          :value="getStatusLabel(currentMember.status)"
          description="Estado atual do sócio"
        />

        <AdminStatCard
          :label="`Quota ${currentYear}`"
          :value="getQuotaLabel(currentQuota?.status)"
          description="Situação da quota anual"
        />
      </div>

      <div class="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <h2 class="text-xl font-bold text-gray-950">
                Dados pessoais
              </h2>

              <UBadge
                :color="getStatusColor(currentMember.status)"
                variant="soft"
              >
                {{ getStatusLabel(currentMember.status) }}
              </UBadge>
            </div>
          </template>

          <div class="grid gap-4 text-sm md:grid-cols-2">
            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-gray-500">
                Nome
              </p>

              <p class="mt-1 font-medium text-gray-950">
                {{ currentMember.fullName }}
              </p>
            </div>

            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-gray-500">
                Email
              </p>

              <p class="mt-1 font-medium text-gray-950">
                {{ currentMember.email }}
              </p>
            </div>

            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-gray-500">
                Telefone
              </p>

              <p class="mt-1 font-medium text-gray-950">
                {{ currentMember.phone }}
              </p>
            </div>

            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-gray-500">
                Morada
              </p>

              <p class="mt-1 font-medium text-gray-950">
                {{ currentMember.address }}
              </p>
            </div>

            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-gray-500">
                Data de inscrição
              </p>

              <p class="mt-1 font-medium text-gray-950">
                {{ currentMember.joinedAt }}
              </p>
            </div>

            <div
              v-if="currentMember.birthDate"
              class="rounded-xl bg-gray-50 p-4"
            >
              <p class="text-gray-500">
                Data de nascimento
              </p>

              <p class="mt-1 font-medium text-gray-950">
                {{ currentMember.birthDate }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-950">
              Quota atual
            </h2>
          </template>

          <div v-if="currentQuota">
            <UBadge
              :color="getQuotaColor(currentQuota.status)"
              variant="soft"
            >
              {{ getQuotaLabel(currentQuota.status) }}
            </UBadge>

            <p class="mt-4 text-sm text-gray-600">
              Ano: {{ currentQuota.year }}
            </p>

            <p class="mt-2 text-sm text-gray-600">
              Valor: {{ currentQuota.amount }}€
            </p>

            <p
              v-if="currentQuota.paidAt"
              class="mt-2 text-sm text-gray-600"
            >
              Pago em: {{ currentQuota.paidAt }}
            </p>

            <p
              v-else
              class="mt-2 text-sm text-gray-600"
            >
              Ainda não existe data de pagamento registada.
            </p>
          </div>

          <p
            v-else
            class="text-sm text-gray-600"
          >
            Não existe quota criada para o ano atual.
          </p>

          <template #footer>
            <UButton
              to="/area-socio/quotas"
              variant="outline"
            >
              Ver histórico de quotas
            </UButton>
          </template>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>