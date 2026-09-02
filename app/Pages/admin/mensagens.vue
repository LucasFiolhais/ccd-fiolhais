<script setup lang="ts">
import {
  useSupabaseAdminContactMessages,
  type ContactMessage,
  type ContactMessageStatus
} from '~/composables/useSupabaseAdminContactMessages'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Mensagens'
})

type StatusFilter = 'all' | ContactMessageStatus

const {
  getContactMessages,
  updateContactMessageStatus
} = useSupabaseAdminContactMessages()

const messages = ref<ContactMessage[]>([])
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
    label: 'Todas',
    value: 'all'
  },
  {
    label: 'Novas',
    value: 'new'
  },
  {
    label: 'Lidas',
    value: 'read'
  },
  {
    label: 'Arquivadas',
    value: 'archived'
  }
]

const getStatusLabel = (status: ContactMessageStatus) => {
  if (status === 'new') {
    return 'Nova'
  }

  if (status === 'read') {
    return 'Lida'
  }

  return 'Arquivada'
}

const getStatusClass = (status: ContactMessageStatus) => {
  if (status === 'new') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  if (status === 'read') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  return 'border-gray-200 bg-gray-50 text-gray-600'
}

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value))
}

const totalMessages = computed(() => {
  return messages.value.length
})

const newMessages = computed(() => {
  return messages.value.filter((message) => message.status === 'new').length
})

const readMessages = computed(() => {
  return messages.value.filter((message) => message.status === 'read').length
})

const archivedMessages = computed(() => {
  return messages.value.filter((message) => message.status === 'archived').length
})

const filteredMessages = computed(() => {
  return messages.value.filter((message) => {
    const searchValue = searchTerm.value.toLowerCase()

    const matchesSearch = [
      message.fullName,
      message.email,
      message.message
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchValue)

    const matchesStatus =
      selectedStatus.value === 'all' ||
      message.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

const loadMessages = async () => {
  isLoading.value = true
  submitError.value = ''
  successMessage.value = ''

  const result = await getContactMessages()

  isLoading.value = false

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível carregar as mensagens.'
    return
  }

  messages.value = result.messages
}

const updateLocalMessageStatus = (
  messageId: string,
  status: ContactMessageStatus
) => {
  messages.value = messages.value.map((message) => {
    if (message.id !== messageId) {
      return message
    }

    return {
      ...message,
      status
    }
  })
}

const handleMarkAsRead = async (messageId: string) => {
  submitError.value = ''
  successMessage.value = ''

  const result = await updateContactMessageStatus(messageId, 'read')

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível marcar a mensagem como lida.'
    return
  }

  updateLocalMessageStatus(messageId, 'read')
  successMessage.value = 'Mensagem marcada como lida.'
}

const handleArchive = async (messageId: string) => {
  submitError.value = ''
  successMessage.value = ''

  const result = await updateContactMessageStatus(messageId, 'archived')

  if (!result.success) {
    submitError.value = result.error || 'Não foi possível arquivar a mensagem.'
    return
  }

  updateLocalMessageStatus(messageId, 'archived')
  successMessage.value = 'Mensagem arquivada com sucesso.'
}

const handleReload = async () => {
  await loadMessages()
}

onMounted(async () => {
  await loadMessages()
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
          Mensagens de contacto
        </h1>

        <p class="mt-2 text-gray-600">
          Consulta as mensagens enviadas através do formulário público de contactos.
        </p>
      </div>

      <button
        type="button"
        class="rounded-xl border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
        @click="handleReload"
      >
        Recarregar mensagens
      </button>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Total"
        :value="totalMessages"
        description="Mensagens recebidas"
      />

      <AdminStatCard
        label="Novas"
        :value="newMessages"
        description="Ainda por ler"
      />

      <AdminStatCard
        label="Lidas"
        :value="readMessages"
        description="Mensagens analisadas"
      />

      <AdminStatCard
        label="Arquivadas"
        :value="archivedMessages"
        description="Mensagens guardadas"
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
            placeholder="Pesquisar por nome, email ou mensagem..."
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
        A carregar mensagens...
      </div>

      <div
        v-else-if="filteredMessages.length"
        class="divide-y divide-gray-200"
      >
        <article
          v-for="message in filteredMessages"
          :key="message.id"
          class="p-6"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <h2 class="text-xl font-bold text-gray-950">
                  {{ message.fullName }}
                </h2>

                <span
                  class="rounded-full border px-3 py-1 text-xs font-bold"
                  :class="getStatusClass(message.status)"
                >
                  {{ getStatusLabel(message.status) }}
                </span>
              </div>

              <p class="mt-2 text-sm text-gray-500">
                {{ message.email }} · {{ formatDate(message.createdAt) }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-if="message.status !== 'read'"
                type="button"
                class="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                @click="handleMarkAsRead(message.id)"
              >
                Marcar como lida
              </button>

              <button
                v-if="message.status !== 'archived'"
                type="button"
                class="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                @click="handleArchive(message.id)"
              >
                Arquivar
              </button>
            </div>
          </div>

          <div class="mt-5 rounded-2xl bg-gray-50 p-5 leading-7 text-gray-700">
            {{ message.message }}
          </div>

          <div class="mt-4">
            <a
              :href="`mailto:${message.email}`"
              class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
            >
              Responder por email
            </a>
          </div>
        </article>
      </div>

      <SharedEmptyState
        v-else
        class="m-6"
        icon="✉️"
        title="Nenhuma mensagem encontrada"
        description="Ainda não existem mensagens com os filtros selecionados."
      />
    </div>
  </UContainer>
</template>