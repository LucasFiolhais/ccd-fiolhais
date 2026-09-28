<script setup lang="ts">
import { useSupabaseMemberAuth } from '~/composables/useSupabaseMemberAuth'
import {
  useSupabaseMemberArea,
  type MemberAreaData,
  type MemberAreaQuotaStatus,
  type MemberAreaStatus
} from '~/composables/useSupabaseMemberArea'

const {
  isLoggedIn,
  loadMemberUser,
  signOutMember
} = useSupabaseMemberAuth()

const {
  getMyMemberData
} = useSupabaseMemberArea()

useHead({
  title: 'Área do Sócio'
})

const member = ref<MemberAreaData | null>(null)
const isLoading = ref(true)
const loadError = ref('')

const currentYear = new Date().getFullYear()

const getMemberStatusLabel = (
  status: MemberAreaStatus
) => {
  if (status === 'active') {
    return 'Ativo'
  }

  if (status === 'pending') {
    return 'Pendente'
  }

  return 'Inativo'
}

const getMemberStatusClass = (
  status: MemberAreaStatus
) => {
  if (status === 'active') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'pending') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  return 'border-gray-200 bg-gray-50 text-gray-600'
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

const formatDate = (value?: string) => {
  if (!value) {
    return 'Não indicada'
  }

  const date = value.includes('T')
    ? new Date(value)
    : new Date(`${value}T00:00:00`)

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'long'
  }).format(date)
}

const paidQuotas = computed(() => {
  if (!member.value) {
    return 0
  }

  return member.value.quotas.filter((quota) => {
    return quota.status === 'paid'
  }).length
})

const loadArea = async () => {
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

  if (!result.success) {
    loadError.value =
      result.error ||
      'Não foi possível carregar a área do sócio.'

    return
  }

  if (!result.member) {
    await signOutMember()
    await navigateTo('/socios/login')
    return
  }

  member.value = result.member
}

const handleLogout = async () => {
  await signOutMember()
  await navigateTo('/socios/login')
}

onMounted(async () => {
  await loadArea()
})
</script>

<template>
  <section class="min-h-[70vh] bg-[#f8f4ea] py-12">
    <UContainer>
      <div
        v-if="isLoading"
        class="rounded-3xl border border-amber-200 bg-white p-10 text-center text-gray-600 shadow-sm"
      >
        A carregar a tua área...
      </div>

      <div
        v-else-if="loadError"
        class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"
      >
        <p class="font-bold">
          Não foi possível carregar a área do sócio
        </p>

        <p class="mt-2">
          {{ loadError }}
        </p>
      </div>

      <div
        v-else-if="member"
        class="space-y-8"
      >
        <header class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
              Área do Sócio
            </p>

            <h1 class="mt-2 text-3xl font-black text-gray-950 sm:text-4xl">
              Olá, {{ member.fullName }}
            </h1>

            <p class="mt-3 text-gray-600">
              Sócio nº {{ member.number }}
            </p>

            <span
              class="mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-bold"
              :class="getMemberStatusClass(member.status)"
            >
              {{ getMemberStatusLabel(member.status) }}
            </span>
          </div>

          <button
            type="button"
            class="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            @click="handleLogout"
          >
            Terminar sessão
          </button>
        </header>

        <nav class="grid gap-4 sm:grid-cols-3">
          <NuxtLink
            to="/area-socio"
            class="rounded-2xl border border-amber-400 bg-amber-50 p-5"
          >
            <p class="text-2xl">
              👤
            </p>

            <p class="mt-3 font-bold text-gray-950">
              Resumo
            </p>

            <p class="mt-1 text-sm text-gray-600">
              Dados do meu perfil
            </p>
          </NuxtLink>

          <NuxtLink
            to="/area-socio/quotas"
            class="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <p class="text-2xl">
              💶
            </p>

            <p class="mt-3 font-bold text-gray-950">
              Quotas
            </p>

            <p class="mt-1 text-sm text-gray-600">
              Consultar pagamentos
            </p>
          </NuxtLink>

          <NuxtLink
            to="/area-socio/eventos"
            class="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <p class="text-2xl">
              🎟️
            </p>

            <p class="mt-3 font-bold text-gray-950">
              Eventos
            </p>

            <p class="mt-1 text-sm text-gray-600">
              As minhas inscrições
            </p>
          </NuxtLink>
        </nav>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-gray-500">
              Número de sócio
            </p>

            <p class="mt-3 text-3xl font-black text-gray-950">
              {{ member.number }}
            </p>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-gray-500">
              Quotas pagas
            </p>

            <p class="mt-3 text-3xl font-black text-gray-950">
              {{ paidQuotas }}
            </p>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-gray-500">
              Quota {{ currentYear }}
            </p>

            <div
              v-if="member.currentQuota"
              class="mt-3"
            >
              <span
                class="inline-flex rounded-full border px-3 py-1 text-sm font-bold"
                :class="getQuotaStatusClass(member.currentQuota.status)"
              >
                {{ getQuotaStatusLabel(member.currentQuota.status) }}
              </span>
            </div>

            <p
              v-else
              class="mt-3 font-semibold text-gray-500"
            >
              Ainda não registada
            </p>
          </div>
        </div>

        <section class="rounded-3xl border border-amber-200 bg-white shadow-sm">
          <div class="border-b border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-950">
              Os meus dados
            </h2>

            <p class="mt-2 text-gray-600">
              Informação atualmente registada na associação.
            </p>
          </div>

          <div class="grid gap-4 p-6 md:grid-cols-2">
            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Nome
              </p>

              <p class="mt-1 text-gray-950">
                {{ member.fullName }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Email
              </p>

              <p class="mt-1 break-all text-gray-950">
                {{ member.email }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Telefone
              </p>

              <p class="mt-1 text-gray-950">
                {{ member.phone }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Data de nascimento
              </p>

              <p class="mt-1 text-gray-950">
                {{ formatDate(member.birthDate) }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4 md:col-span-2">
              <p class="text-sm font-semibold text-gray-500">
                Morada
              </p>

              <p class="mt-1 whitespace-pre-line text-gray-950">
                {{ member.address }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Sócio desde
              </p>

              <p class="mt-1 text-gray-950">
                {{ formatDate(member.joinedAt) }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Estado
              </p>

              <p class="mt-1 text-gray-950">
                {{ getMemberStatusLabel(member.status) }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </UContainer>
  </section>
</template>