<script setup lang="ts">
import {
  useSupabaseAdminMemberApplications,
  type MemberApplication,
  type MemberApplicationStatus
} from '~/composables/useSupabaseAdminMemberApplications'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Pedidos de Sócio'
})

type StatusFilter = 'all' | MemberApplicationStatus

const {
  getMemberApplications,
  updateMemberApplicationStatus,
  createMemberFromApplication
} = useSupabaseAdminMemberApplications()

const applications = ref<MemberApplication[]>([])
const searchTerm = ref('')
const selectedStatus = ref<StatusFilter>('all')
const isLoading = ref(true)
const submitError = ref('')
const successMessage = ref('')

const statusOptions: Array<{
  label: string
  value: StatusFilter
}> = [
  {
    label: 'Todos',
    value: 'all'
  },
  {
    label: 'Novos',
    value: 'new'
  },
  {
    label: 'Aprovados',
    value: 'approved'
  },
  {
    label: 'Rejeitados',
    value: 'rejected'
  }
]

const getStatusLabel = (status: MemberApplicationStatus) => {
  if (status === 'new') {
    return 'Novo'
  }

  if (status === 'approved') {
    return 'Aprovado'
  }

  return 'Rejeitado'
}

const getStatusClass = (status: MemberApplicationStatus) => {
  if (status === 'new') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  if (status === 'approved') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  return 'border-red-200 bg-red-50 text-red-700'
}

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value))
}

const formatBirthDate = (value?: string) => {
  if (!value) {
    return 'Não indicada'
  }

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short'
  }).format(new Date(value))
}

const totalApplications = computed(() => {
  return applications.value.length
})

const newApplications = computed(() => {
  return applications.value.filter((application) => application.status === 'new').length
})

const approvedApplications = computed(() => {
  return applications.value.filter((application) => application.status === 'approved').length
})

const rejectedApplications = computed(() => {
  return applications.value.filter((application) => application.status === 'rejected').length
})

const filteredApplications = computed(() => {
  return applications.value.filter((application) => {
    const searchValue = searchTerm.value.toLowerCase()

    const matchesSearch = [
      application.fullName,
      application.email,
      application.phone,
      application.address,
      application.notes || ''
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchValue)

    const matchesStatus =
      selectedStatus.value === 'all' ||
      application.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

const loadApplications = async () => {
  isLoading.value = true
  submitError.value = ''
  successMessage.value = ''

  const result = await getMemberApplications()

  isLoading.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível carregar os pedidos de sócio.'
    return
  }

  applications.value = result.applications
}

const updateLocalApplicationStatus = (
  applicationId: string,
  status: MemberApplicationStatus
) => {
  applications.value = applications.value.map((application) => {
    if (application.id !== applicationId) {
      return application
    }

    return {
      ...application,
      status
    }
  })
}

const handleApprove = async (applicationId: string) => {
  submitError.value = ''
  successMessage.value = ''

  const result = await updateMemberApplicationStatus(applicationId, 'approved')

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível aprovar o pedido.'
    return
  }

  updateLocalApplicationStatus(applicationId, 'approved')
  successMessage.value = 'Pedido de sócio aprovado com sucesso.'
}

const handleCreateMember = async (application: MemberApplication) => {
  submitError.value = ''
  successMessage.value = ''

  const result = await createMemberFromApplication(application)

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível criar o sócio.'
    return
  }

  updateLocalApplicationStatus(application.id, 'approved')
  successMessage.value = `Sócio criado com sucesso com o número ${result.memberNumber}.`
}

const handleReject = async (applicationId: string) => {
  submitError.value = ''
  successMessage.value = ''

  const result = await updateMemberApplicationStatus(applicationId, 'rejected')

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível rejeitar o pedido.'
    return
  }

  updateLocalApplicationStatus(applicationId, 'rejected')
  successMessage.value = 'Pedido de sócio rejeitado.'
}

const handleMarkAsNew = async (applicationId: string) => {
  submitError.value = ''
  successMessage.value = ''

  const result = await updateMemberApplicationStatus(applicationId, 'new')

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível reabrir o pedido.'
    return
  }

  updateLocalApplicationStatus(applicationId, 'new')
  successMessage.value = 'Pedido marcado novamente como novo.'
}

const handleReload = async () => {
  await loadApplications()
}

onMounted(async () => {
  await loadApplications()
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
          Pedidos de inscrição de sócio
        </h1>

        <p class="mt-2 text-gray-600">
          Consulta e valida os pedidos enviados através do formulário público “Torne-se sócio”.
        </p>
      </div>

      <button
        type="button"
        class="rounded-xl border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
        @click="handleReload"
      >
        Recarregar pedidos
      </button>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Total"
        :value="totalApplications"
        description="Pedidos recebidos"
      />

      <AdminStatCard
        label="Novos"
        :value="newApplications"
        description="Ainda por analisar"
      />

      <AdminStatCard
        label="Aprovados"
        :value="approvedApplications"
        description="Pedidos aceites"
      />

      <AdminStatCard
        label="Rejeitados"
        :value="rejectedApplications"
        description="Pedidos recusados"
      />
    </div>

    <div
      v-if="submitError"
      class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
    >
      <p class="font-bold">
        Erro
      </p>

      <p class="mt-2">
        {{ submitError }}
      </p>
    </div>

    <div
      v-if="successMessage"
      class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
    >
      <p class="font-bold">
        Ação concluída
      </p>

      <p class="mt-2">
        {{ successMessage }}
      </p>
    </div>

    <div class="mt-8 rounded-3xl border border-amber-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 p-6">
        <div class="grid gap-4 lg:grid-cols-[1fr_260px]">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Pesquisar por nome, email, telefone ou morada..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >

          <select
            v-model="selectedStatus"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option
              v-for="status in statusOptions"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="p-8 text-center text-gray-600"
      >
        A carregar pedidos...
      </div>

      <div
        v-else-if="filteredApplications.length"
        class="divide-y divide-gray-200"
      >
        <article
          v-for="application in filteredApplications"
          :key="application.id"
          class="p-6"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <h2 class="text-xl font-bold text-gray-950">
                  {{ application.fullName }}
                </h2>

                <span
                  class="rounded-full border px-3 py-1 text-xs font-bold"
                  :class="getStatusClass(application.status)"
                >
                  {{ getStatusLabel(application.status) }}
                </span>
              </div>

              <p class="mt-2 text-sm text-gray-500">
                Pedido enviado em {{ formatDate(application.createdAt) }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">

              <button
  v-if="application.status !== 'approved'"
  type="button"
  class="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
  @click="handleCreateMember(application)"
>
  Criar sócio
</button>

              <button
                v-if="application.status !== 'approved'"
                type="button"
                class="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                @click="handleApprove(application.id)"
              >
                Aprovar
              </button>

              <button
                v-if="application.status !== 'rejected'"
                type="button"
                class="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                @click="handleReject(application.id)"
              >
                Rejeitar
              </button>

              <button
                v-if="application.status !== 'new'"
                type="button"
                class="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                @click="handleMarkAsNew(application.id)"
              >
                Reabrir
              </button>
            </div>
          </div>

          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Email
              </p>

              <p class="mt-1 break-all text-gray-950">
                {{ application.email }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Telefone
              </p>

              <p class="mt-1 text-gray-950">
                {{ application.phone }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Data de nascimento
              </p>

              <p class="mt-1 text-gray-950">
                {{ formatBirthDate(application.birthDate) }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-500">
                Notificações
              </p>

              <p class="mt-1 text-gray-950">
                {{ application.wantsNotifications ? 'Sim' : 'Não' }}
              </p>
            </div>
          </div>

          <div class="mt-4 rounded-2xl bg-gray-50 p-4">
            <p class="text-sm font-semibold text-gray-500">
              Morada
            </p>

            <p class="mt-1 whitespace-pre-line text-gray-950">
              {{ application.address }}
            </p>
          </div>

          <div
            v-if="application.notes"
            class="mt-4 rounded-2xl bg-gray-50 p-4"
          >
            <p class="text-sm font-semibold text-gray-500">
              Observações
            </p>

            <p class="mt-1 whitespace-pre-line text-gray-950">
              {{ application.notes }}
            </p>
          </div>

          <div class="mt-4 flex flex-wrap gap-4">
            <a
              :href="`mailto:${application.email}`"
              class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
            >
              Responder por email
            </a>

            <a
              :href="`tel:${application.phone}`"
              class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
            >
              Contactar por telefone
            </a>
          </div>
        </article>
      </div>

      <SharedEmptyState
        v-else
        class="m-6"
        icon="👥"
        title="Nenhum pedido encontrado"
        description="Ainda não existem pedidos de sócio com os filtros selecionados."
      />
    </div>
  </UContainer>
</template>