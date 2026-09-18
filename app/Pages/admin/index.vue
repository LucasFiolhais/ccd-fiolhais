<script setup lang="ts">
import {
  useSupabaseAdminDashboard,
  type AdminDashboardData,
  type DashboardApplicationStatus,
  type DashboardEventStatus,
  type DashboardMessageStatus
} from '~/composables/useSupabaseAdminDashboard'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Dashboard'
})

const { getDashboardData } = useSupabaseAdminDashboard()

const currentYear = new Date().getFullYear()

const dashboard = ref<AdminDashboardData | null>(null)

const isLoading = ref(true)
const submitError = ref('')

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value))
}

const formatEventDate = (
  eventDate: string | undefined,
  dateLabel: string
) => {
  if (!eventDate) {
    return dateLabel
  }

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short'
  }).format(
    new Date(`${eventDate}T00:00:00`)
  )
}

const getMessageStatusLabel = (
  status: DashboardMessageStatus
) => {
  if (status === 'new') {
    return 'Nova'
  }

  if (status === 'read') {
    return 'Lida'
  }

  return 'Arquivada'
}

const getMessageStatusClass = (
  status: DashboardMessageStatus
) => {
  if (status === 'new') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  if (status === 'read') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  return 'border-gray-200 bg-gray-50 text-gray-600'
}

const getApplicationStatusLabel = (
  status: DashboardApplicationStatus
) => {
  if (status === 'new') {
    return 'Novo'
  }

  if (status === 'approved') {
    return 'Aprovado'
  }

  return 'Rejeitado'
}

const getApplicationStatusClass = (
  status: DashboardApplicationStatus
) => {
  if (status === 'new') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  if (status === 'approved') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  return 'border-red-200 bg-red-50 text-red-700'
}

const getEventStatusLabel = (
  status: DashboardEventStatus
) => {
  if (status === 'draft') {
    return 'Rascunho'
  }

  if (status === 'open') {
    return 'Aberto'
  }

  if (status === 'soon') {
    return 'Brevemente'
  }

  if (status === 'sold_out') {
    return 'Esgotado'
  }

  return 'Fechado'
}

const getEventStatusClass = (
  status: DashboardEventStatus
) => {
  if (status === 'open') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'soon') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  if (status === 'sold_out') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  if (status === 'closed') {
    return 'border-gray-200 bg-gray-50 text-gray-600'
  }

  return 'border-sky-200 bg-sky-50 text-sky-700'
}

const loadDashboard = async () => {
  isLoading.value = true
  submitError.value = ''

  const result = await getDashboardData()

  isLoading.value = false

  if (!result.success || !result.data) {
    submitError.value =
      result.error ||
      'Não foi possível carregar os dados do dashboard.'

    return
  }

  dashboard.value = result.data
}

const handleReload = async () => {
  await loadDashboard()
}

onMounted(async () => {
  await loadDashboard()
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
          Dashboard
        </h1>

        <p class="mt-2 text-gray-600">
          Visão geral dos dados reais do CCD Fiolhais.
        </p>
      </div>

      <button
        type="button"
        class="rounded-xl border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
        @click="handleReload"
      >
        Atualizar dashboard
      </button>
    </div>

    <div
      v-if="submitError"
      class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
    >
      <p class="font-bold">
        Erro
      </p>

      <p class="mt-2">
        {{ submitError }}
      </p>
    </div>

    <div
      v-if="isLoading"
      class="rounded-3xl border border-amber-200 bg-white p-10 text-center text-gray-600 shadow-sm"
    >
      A carregar dados do Supabase...
    </div>

    <div
      v-else-if="dashboard"
      class="space-y-8"
    >
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Sócios"
          :value="dashboard.stats.totalMembers"
          description="Total registado"
        />

        <AdminStatCard
          label="Sócios ativos"
          :value="dashboard.stats.activeMembers"
          description="Atualmente ativos"
        />

        <AdminStatCard
          label="Pedidos de sócio"
          :value="dashboard.stats.pendingApplications"
          description="Ainda por analisar"
        />

        <AdminStatCard
          :label="`Quotas ${currentYear}`"
          :value="dashboard.stats.unpaidQuotas"
          description="Pendentes ou em atraso"
        />

        <AdminStatCard
          label="Eventos abertos"
          :value="dashboard.stats.openEvents"
          description="Com inscrições abertas"
        />

        <AdminStatCard
          label="Inscrições pendentes"
          :value="dashboard.stats.pendingRegistrations"
          description="Eventos por confirmar"
        />

        <AdminStatCard
          label="Mensagens novas"
          :value="dashboard.stats.newMessages"
          description="Ainda por ler"
        />

        <AdminStatCard
          :label="`Quotas recebidas ${currentYear}`"
          :value="formatMoney(dashboard.stats.paidQuotaAmount)"
          description="Valor marcado como pago"
        />
      </div>

      <div class="grid gap-8 xl:grid-cols-3">
        <section class="rounded-3xl border border-amber-200 bg-white shadow-sm">
          <div class="flex items-center justify-between border-b border-gray-200 p-6">
            <div>
              <h2 class="text-xl font-bold text-gray-950">
                Pedidos de sócio
              </h2>

              <p class="mt-1 text-sm text-gray-500">
                Pedidos mais recentes
              </p>
            </div>

            <NuxtLink
              to="/admin/pedidos-socio"
              class="text-sm font-semibold text-amber-700 hover:text-amber-600"
            >
              Ver todos
            </NuxtLink>
          </div>

          <div
            v-if="dashboard.recentApplications.length"
            class="divide-y divide-gray-200"
          >
            <article
              v-for="application in dashboard.recentApplications"
              :key="application.id"
              class="p-5"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-bold text-gray-950">
                    {{ application.fullName }}
                  </p>

                  <p class="mt-1 break-all text-sm text-gray-600">
                    {{ application.email }}
                  </p>

                  <p class="mt-1 text-sm text-gray-500">
                    {{ application.phone }}
                  </p>
                </div>

                <span
                  class="shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold"
                  :class="getApplicationStatusClass(application.status)"
                >
                  {{ getApplicationStatusLabel(application.status) }}
                </span>
              </div>

              <p class="mt-3 text-xs text-gray-500">
                {{ formatDateTime(application.createdAt) }}
              </p>
            </article>
          </div>

          <div
            v-else
            class="p-6 text-sm text-gray-500"
          >
            Ainda não existem pedidos de sócio.
          </div>
        </section>

        <section class="rounded-3xl border border-amber-200 bg-white shadow-sm">
          <div class="flex items-center justify-between border-b border-gray-200 p-6">
            <div>
              <h2 class="text-xl font-bold text-gray-950">
                Mensagens
              </h2>

              <p class="mt-1 text-sm text-gray-500">
                Contactos mais recentes
              </p>
            </div>

            <NuxtLink
              to="/admin/mensagens"
              class="text-sm font-semibold text-amber-700 hover:text-amber-600"
            >
              Ver todas
            </NuxtLink>
          </div>

          <div
            v-if="dashboard.recentMessages.length"
            class="divide-y divide-gray-200"
          >
            <article
              v-for="message in dashboard.recentMessages"
              :key="message.id"
              class="p-5"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-bold text-gray-950">
                    {{ message.fullName }}
                  </p>

                  <p class="mt-1 break-all text-sm text-gray-600">
                    {{ message.email }}
                  </p>
                </div>

                <span
                  class="shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold"
                  :class="getMessageStatusClass(message.status)"
                >
                  {{ getMessageStatusLabel(message.status) }}
                </span>
              </div>

              <p class="mt-3 text-xs text-gray-500">
                {{ formatDateTime(message.createdAt) }}
              </p>
            </article>
          </div>

          <div
            v-else
            class="p-6 text-sm text-gray-500"
          >
            Ainda não existem mensagens.
          </div>
        </section>

        <section class="rounded-3xl border border-amber-200 bg-white shadow-sm">
          <div class="flex items-center justify-between border-b border-gray-200 p-6">
            <div>
              <h2 class="text-xl font-bold text-gray-950">
                Eventos
              </h2>

              <p class="mt-1 text-sm text-gray-500">
                Eventos mais recentes
              </p>
            </div>

            <NuxtLink
              to="/admin/eventos"
              class="text-sm font-semibold text-amber-700 hover:text-amber-600"
            >
              Ver todos
            </NuxtLink>
          </div>

          <div
            v-if="dashboard.recentEvents.length"
            class="divide-y divide-gray-200"
          >
            <article
              v-for="event in dashboard.recentEvents"
              :key="event.id"
              class="p-5"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <NuxtLink
                    :to="`/admin/eventos/${event.slug}`"
                    class="font-bold text-gray-950 transition hover:text-amber-700"
                  >
                    {{ event.title }}
                  </NuxtLink>

                  <p class="mt-1 text-sm text-gray-500">
                    {{ formatEventDate(event.eventDate, event.dateLabel) }}
                  </p>

                  <p class="mt-1 text-xs text-gray-500">
                    {{ event.isPublished ? 'Publicado no site' : 'Não publicado' }}
                  </p>
                </div>

                <span
                  class="shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold"
                  :class="getEventStatusClass(event.status)"
                >
                  {{ getEventStatusLabel(event.status) }}
                </span>
              </div>
            </article>
          </div>

          <div
            v-else
            class="p-6 text-sm text-gray-500"
          >
            Ainda não existem eventos.
          </div>
        </section>
      </div>

      <section class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-gray-950">
          Acessos rápidos
        </h2>

        <p class="mt-2 text-gray-600">
          Acede diretamente às principais áreas de gestão.
        </p>

        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            to="/admin/socios"
            class="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <p class="text-2xl">
              👥
            </p>

            <p class="mt-3 font-bold text-gray-950">
              Sócios
            </p>

            <p class="mt-1 text-sm text-gray-600">
              Consultar e editar sócios
            </p>
          </NuxtLink>

          <NuxtLink
            to="/admin/quotas"
            class="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <p class="text-2xl">
              💶
            </p>

            <p class="mt-3 font-bold text-gray-950">
              Quotas
            </p>

            <p class="mt-1 text-sm text-gray-600">
              Gerir pagamentos e quotas
            </p>
          </NuxtLink>

          <NuxtLink
            to="/admin/eventos"
            class="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <p class="text-2xl">
              📅
            </p>

            <p class="mt-3 font-bold text-gray-950">
              Eventos
            </p>

            <p class="mt-1 text-sm text-gray-600">
              Eventos e inscrições
            </p>
          </NuxtLink>

          <NuxtLink
            to="/admin/mural"
            class="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <p class="text-2xl">
              🖼️
            </p>

            <p class="mt-3 font-bold text-gray-950">
              Mural
            </p>

            <p class="mt-1 text-sm text-gray-600">
              Gerir publicações
            </p>
          </NuxtLink>
        </div>
      </section>
    </div>
  </UContainer>
</template>