<script setup lang="ts">
import { useMembers } from '~/composables/useMembers'
import { useMemberSession } from '~/composables/useMemberSession'
import type { MemberStatus, QuotaStatus } from '~/types/member'

const { getMembers, getCurrentQuota } = useMembers()
const { currentMember, isLoggedIn, loginAsMember } = useMemberSession()

const currentYear = new Date().getFullYear()

const members = computed(() => {
  return getMembers()
})

const selectedMemberNumber = ref(getMembers()[0]?.number || '')
const loginError = ref('')

const memberOptions = computed(() => {
  return members.value.map((member) => ({
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

const getStatusClass = (status: MemberStatus) => {
  if (status === 'active') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  if (status === 'pending') {
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  return 'bg-gray-50 text-gray-700 border-gray-200'
}

const getQuotaLabel = (status?: QuotaStatus) => {
  if (status === 'paid') return 'Pago'
  if (status === 'pending') return 'Pendente'
  if (status === 'overdue') return 'Em atraso'
  if (status === 'exempt') return 'Isento'

  return 'Sem quota'
}

const getQuotaClass = (status?: QuotaStatus) => {
  if (status === 'paid') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  if (status === 'pending') {
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  if (status === 'overdue') {
    return 'bg-red-50 text-red-700 border-red-200'
  }

  if (status === 'exempt') {
    return 'bg-sky-50 text-sky-700 border-sky-200'
  }

  return 'bg-gray-50 text-gray-700 border-gray-200'
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
  <div>
    <section class="bg-gray-50 py-16">
      <UContainer>
        <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
          Área do Sócio
        </p>

        <h1 class="mt-3 text-4xl font-bold text-gray-950">
          Portal do sócio
        </h1>

        <p class="mt-4 max-w-3xl text-lg leading-8 text-gray-700">
          Consulta os teus dados, quotas e inscrições em eventos.
        </p>
      </UContainer>
    </section>

    <section class="py-12">
      <UContainer>
        <div
          v-if="!isLoggedIn"
          class="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-white p-8 shadow-sm"
        >
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
              Sessão simulada
            </p>

            <h2 class="mt-2 text-2xl font-bold text-gray-950">
              Entrar como sócio
            </h2>

            <p class="mt-3 leading-7 text-gray-700">
              Nesta fase ainda não existe login real. Escolhe um sócio para simular o acesso
              à área pessoal.
            </p>
          </div>

          <div class="mt-8 grid gap-4 md:grid-cols-[1fr_auto]">
            <select
              v-model="selectedMemberNumber"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >
              <option
                v-for="member in memberOptions"
                :key="member.value"
                :value="member.value"
              >
                {{ member.label }}
              </option>
            </select>

            <button
              type="button"
              class="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
              @click="handleLogin"
            >
              Entrar
            </button>
          </div>

          <p
            v-if="loginError"
            class="mt-3 text-sm font-medium text-red-600"
          >
            {{ loginError }}
          </p>
        </div>

        <div
          v-else-if="currentMember"
          class="space-y-8"
        >
          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
                  Sessão mockada
                </p>

                <h2 class="mt-2 text-2xl font-bold text-gray-950">
                  {{ currentMember.fullName }}
                </h2>

                <p class="mt-1 text-gray-600">
                  Sócio nº {{ currentMember.number }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <NuxtLink
                  to="/area-socio"
                  class="rounded-xl border border-amber-500 bg-amber-500 px-4 py-2 text-sm font-semibold text-black"
                >
                  Dados pessoais
                </NuxtLink>

                <NuxtLink
                  to="/area-socio/quotas"
                  class="rounded-xl border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                >
                  Quotas
                </NuxtLink>

                <NuxtLink
                  to="/area-socio/eventos"
                  class="rounded-xl border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                >
                  Eventos
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-3">
            <div class="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
              <div class="mb-5 h-1 w-12 rounded-full ccd-gold-gradient" />

              <p class="text-sm font-medium text-gray-600">
                Número de sócio
              </p>

              <p class="mt-3 text-3xl font-bold text-gray-950">
                {{ currentMember.number }}
              </p>

              <p class="mt-2 text-sm text-gray-500">
                Identificação interna
              </p>
            </div>

            <div class="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
              <div class="mb-5 h-1 w-12 rounded-full ccd-gold-gradient" />

              <p class="text-sm font-medium text-gray-600">
                Estado
              </p>

              <p class="mt-3 text-3xl font-bold text-gray-950">
                {{ getStatusLabel(currentMember.status) }}
              </p>

              <p class="mt-2 text-sm text-gray-500">
                Estado atual do sócio
              </p>
            </div>

            <div class="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
              <div class="mb-5 h-1 w-12 rounded-full ccd-gold-gradient" />

              <p class="text-sm font-medium text-gray-600">
                Quota {{ currentYear }}
              </p>

              <p class="mt-3 text-3xl font-bold text-gray-950">
                {{ getQuotaLabel(currentQuota?.status) }}
              </p>

              <p class="mt-2 text-sm text-gray-500">
                Situação da quota anual
              </p>
            </div>
          </div>

          <div class="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <div class="rounded-3xl border border-amber-200 bg-white shadow-sm">
              <div class="flex items-center justify-between gap-4 border-b border-gray-200 p-6">
                <h2 class="text-xl font-bold text-gray-950">
                  Dados pessoais
                </h2>

                <span
                  class="rounded-full border px-3 py-1 text-xs font-semibold"
                  :class="getStatusClass(currentMember.status)"
                >
                  {{ getStatusLabel(currentMember.status) }}
                </span>
              </div>

              <div class="grid gap-4 p-6 text-sm md:grid-cols-2">
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

                <div class="rounded-xl bg-gray-50 p-4">
                  <p class="text-gray-500">
                    Data de nascimento
                  </p>

                  <p class="mt-1 font-medium text-gray-950">
                    {{ currentMember.birthDate || 'Não indicada' }}
                  </p>
                </div>
              </div>
            </div>

            <div class="rounded-3xl border border-amber-200 bg-white shadow-sm">
              <div class="border-b border-gray-200 p-6">
                <h2 class="text-xl font-bold text-gray-950">
                  Quota atual
                </h2>
              </div>

              <div class="p-6">
                <div v-if="currentQuota">
                  <span
                    class="rounded-full border px-3 py-1 text-xs font-semibold"
                    :class="getQuotaClass(currentQuota.status)"
                  >
                    {{ getQuotaLabel(currentQuota.status) }}
                  </span>

                  <div class="mt-5 space-y-3 text-sm text-gray-700">
                    <p>
                      <span class="font-semibold text-gray-950">Ano:</span>
                      {{ currentQuota.year }}
                    </p>

                    <p>
                      <span class="font-semibold text-gray-950">Valor:</span>
                      {{ currentQuota.amount }}€
                    </p>

                    <p v-if="currentQuota.paidAt">
                      <span class="font-semibold text-gray-950">Pago em:</span>
                      {{ currentQuota.paidAt }}
                    </p>

                    <p v-else>
                      Ainda não existe data de pagamento registada.
                    </p>
                  </div>
                </div>

                <p
                  v-else
                  class="text-sm text-gray-600"
                >
                  Não existe quota criada para o ano atual.
                </p>

                <NuxtLink
                  to="/area-socio/quotas"
                  class="mt-8 inline-flex rounded-xl border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                >
                  Ver histórico de quotas
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>