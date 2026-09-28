<script setup lang="ts">
import { useSupabaseMemberAuth } from '~/composables/useSupabaseMemberAuth'
import {
  useSupabaseMemberArea,
  type MemberAreaData,
  type MemberAreaQuotaStatus
} from '~/composables/useSupabaseMemberArea'

const {
  isLoggedIn,
  loadMemberUser
} = useSupabaseMemberAuth()

const {
  getMyMemberData
} = useSupabaseMemberArea()

useHead({
  title: 'As Minhas Quotas'
})

const member = ref<MemberAreaData | null>(null)
const isLoading = ref(true)
const loadError = ref('')

const currentYear = new Date().getFullYear()

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const formatDate = (value?: string) => {
  if (!value) {
    return ''
  }

  const date = value.includes('T')
    ? new Date(value)
    : new Date(`${value}T00:00:00`)

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'long'
  }).format(date)
}

const getQuotaStatusLabel = (
  status: MemberAreaQuotaStatus
) => {
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

const getQuotaStatusClass = (
  status: MemberAreaQuotaStatus
) => {
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

const totalPaid = computed(() => {
  if (!member.value) {
    return 0
  }

  return member.value.quotas
    .filter((quota) => {
      return quota.status === 'paid'
    })
    .reduce((total, quota) => {
      return total + quota.amount
    }, 0)
})

const paidCount = computed(() => {
  if (!member.value) {
    return 0
  }

  return member.value.quotas.filter((quota) => {
    return quota.status === 'paid'
  }).length
})

const loadQuotas = async () => {
  isLoading.value = true
  loadError.value = ''

  await loadMemberUser()

  if (!isLoggedIn.value) {
    isLoading.value = false
    await navigateTo('/socios/login')
    return
  }

  const result = await getMyMemberData()

  isLoading.value = false

  if (!result.success || !result.member) {
    loadError.value =
      result.error ||
      'Não foi possível carregar as quotas.'

    return
  }

  member.value = result.member
}

onMounted(async () => {
  await loadQuotas()
})
</script>

<template>
  <section class="min-h-[70vh] bg-[#f8f4ea] py-12">
    <UContainer>
      <div
        v-if="isLoading"
        class="rounded-3xl border border-amber-200 bg-white p-10 text-center text-gray-600 shadow-sm"
      >
        A carregar quotas...
      </div>

      <div
        v-else-if="loadError"
        class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"
      >
        {{ loadError }}
      </div>

      <div
        v-else-if="member"
        class="space-y-8"
      >
        <div>
          <NuxtLink
            to="/area-socio"
            class="text-sm font-semibold text-amber-700 hover:text-amber-600"
          >
            ← Voltar à área do sócio
          </NuxtLink>

          <p class="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            Área do Sócio
          </p>

          <h1 class="mt-2 text-3xl font-black text-gray-950">
            As minhas quotas
          </h1>

          <p class="mt-2 text-gray-600">
            Sócio nº {{ member.number }} · {{ member.fullName }}
          </p>
        </div>

        <nav class="grid gap-4 sm:grid-cols-3">
          <NuxtLink
            to="/area-socio"
            class="rounded-2xl border border-gray-200 bg-white p-4 text-center font-semibold text-gray-700"
          >
            👤 Resumo
          </NuxtLink>

          <NuxtLink
            to="/area-socio/quotas"
            class="rounded-2xl border border-amber-400 bg-amber-50 p-4 text-center font-semibold text-amber-800"
          >
            💶 Quotas
          </NuxtLink>

          <NuxtLink
            to="/area-socio/eventos"
            class="rounded-2xl border border-gray-200 bg-white p-4 text-center font-semibold text-gray-700"
          >
            🎟️ Eventos
          </NuxtLink>
        </nav>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-gray-500">
              Quotas registadas
            </p>

            <p class="mt-3 text-3xl font-black text-gray-950">
              {{ member.quotas.length }}
            </p>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-gray-500">
              Quotas pagas
            </p>

            <p class="mt-3 text-3xl font-black text-gray-950">
              {{ paidCount }}
            </p>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-gray-500">
              Total pago
            </p>

            <p class="mt-3 text-3xl font-black text-gray-950">
              {{ formatMoney(totalPaid) }}
            </p>
          </div>
        </div>

        <div
          v-if="member.currentQuota"
          class="rounded-3xl border border-amber-300 bg-white p-6 shadow-sm"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-bold uppercase tracking-wide text-amber-600">
                Ano atual
              </p>

              <h2 class="mt-2 text-2xl font-bold text-gray-950">
                Quota {{ currentYear }}
              </h2>

              <p class="mt-2 text-gray-600">
                {{ formatMoney(member.currentQuota.amount) }}
              </p>
            </div>

            <span
              class="self-start rounded-full border px-4 py-2 text-sm font-bold sm:self-auto"
              :class="getQuotaStatusClass(member.currentQuota.status)"
            >
              {{ getQuotaStatusLabel(member.currentQuota.status) }}
            </span>
          </div>
        </div>

        <section class="rounded-3xl border border-amber-200 bg-white shadow-sm">
          <div class="border-b border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-950">
              Histórico
            </h2>
          </div>

          <div
            v-if="member.quotas.length"
            class="divide-y divide-gray-200"
          >
            <article
              v-for="quota in member.quotas"
              :key="quota.id"
              class="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p class="text-xl font-bold text-gray-950">
                  {{ quota.year }}
                </p>

                <p class="mt-1 text-gray-600">
                  {{ formatMoney(quota.amount) }}
                </p>

                <p
                  v-if="quota.paidAt"
                  class="mt-2 text-sm text-gray-500"
                >
                  Pago em {{ formatDate(quota.paidAt) }}
                </p>
              </div>

              <span
                class="self-start rounded-full border px-3 py-1 text-sm font-bold sm:self-auto"
                :class="getQuotaStatusClass(quota.status)"
              >
                {{ getQuotaStatusLabel(quota.status) }}
              </span>
            </article>
          </div>

          <SharedEmptyState
            v-else
            class="m-6"
            icon="💶"
            title="Sem quotas registadas"
            description="Ainda não existem quotas associadas ao teu registo."
          />
        </section>
      </div>
    </UContainer>
  </section>
</template>