<script setup lang="ts">
import { exportRowsToCsv } from '~/utils/exportCsv'
import {
  useSupabaseAdminEventRegistrations,
  type AdminEventRegistration,
  type AdminRegistrationPaymentStatus,
  type AdminRegistrationStatus
} from '~/composables/useSupabaseAdminEventRegistrations'

const props = defineProps<{
  eventId: string
}>()

const emit = defineEmits<{
  updated: []
}>()

type StatusFilter = 'all' | AdminRegistrationStatus
type PaymentFilter = 'all' | AdminRegistrationPaymentStatus

const {
  getRegistrationsByEventId,
  updateRegistrationStatus,
  updatePaymentStatus
} = useSupabaseAdminEventRegistrations()

const registrations = ref<AdminEventRegistration[]>([])
const searchTerm = ref('')
const selectedStatus = ref<StatusFilter>('all')
const selectedPayment = ref<PaymentFilter>('all')

const isLoading = ref(true)
const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

const statusOptions: Array<{
  label: string
  value: StatusFilter
}> = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Confirmadas', value: 'confirmed' },
  { label: 'Canceladas', value: 'cancelled' }
]

const paymentOptions: Array<{
  label: string
  value: PaymentFilter
}> = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Pagos', value: 'paid' },
  { label: 'Cancelados', value: 'cancelled' }
]

const getStatusLabel = (status: AdminRegistrationStatus) => {
  if (status === 'pending') {
    return 'Pendente'
  }

  if (status === 'confirmed') {
    return 'Confirmada'
  }

  return 'Cancelada'
}

const getPaymentLabel = (status: AdminRegistrationPaymentStatus) => {
  if (status === 'pending') {
    return 'Pendente'
  }

  if (status === 'paid') {
    return 'Pago'
  }

  return 'Cancelado'
}

const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value))
}

const filteredRegistrations = computed(() => {
  return registrations.value.filter((registration) => {
    const searchValue = searchTerm.value.toLowerCase()

    const matchesSearch = [
      registration.fullName,
      registration.email,
      registration.phone,
      registration.memberNumber || ''
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchValue)

    const matchesStatus =
      selectedStatus.value === 'all' ||
      registration.status === selectedStatus.value

    const matchesPayment =
      selectedPayment.value === 'all' ||
      registration.paymentStatus === selectedPayment.value

    return matchesSearch && matchesStatus && matchesPayment
  })
})

const totalRegistrations = computed(() => {
  return registrations.value.length
})

const totalSeats = computed(() => {
  return registrations.value
    .filter((registration) => registration.status !== 'cancelled')
    .reduce((total, registration) => {
      return total + registration.seats
    }, 0)
})

const paidRegistrations = computed(() => {
  return registrations.value.filter((registration) => {
    return registration.paymentStatus === 'paid'
  }).length
})

const pendingPayments = computed(() => {
  return registrations.value.filter((registration) => {
    return registration.paymentStatus === 'pending' &&
      registration.status !== 'cancelled'
  }).length
})

const loadRegistrations = async () => {
  isLoading.value = true
  submitError.value = ''

  const result = await getRegistrationsByEventId(props.eventId)

  isLoading.value = false

  if (!result.success) {
    submitError.value =
      result.error || 'Não foi possível carregar as inscrições.'

    return
  }

  registrations.value = result.registrations
}

const handleRegistrationStatus = async (
  registrationId: string,
  status: AdminRegistrationStatus
) => {
  isSubmitting.value = true
  submitError.value = ''
  successMessage.value = ''

  const result = await updateRegistrationStatus(
    registrationId,
    status
  )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value =
      result.error || 'Não foi possível atualizar a inscrição.'

    return
  }

  successMessage.value = 'Estado da inscrição atualizado.'
  await loadRegistrations()
  emit('updated')
}

const handlePaymentStatus = async (
  registrationId: string,
  status: AdminRegistrationPaymentStatus
) => {
  isSubmitting.value = true
  submitError.value = ''
  successMessage.value = ''

  const result = await updatePaymentStatus(
    registrationId,
    status
  )

  isSubmitting.value = false

  if (!result.success) {
    submitError.value =
      result.error || 'Não foi possível atualizar o pagamento.'

    return
  }

  successMessage.value = 'Estado do pagamento atualizado.'
  await loadRegistrations()
  emit('updated')
}

const handleReload = async () => {
  await loadRegistrations()
}

const handleExport = () => {
  const rows = filteredRegistrations.value.map((registration) => {
    return {
      fullName: registration.fullName,
      email: registration.email,
      phone: `="${registration.phone}"`,
      memberNumber: registration.memberNumber
        ? `="${registration.memberNumber}"`
        : '',
      seats: registration.seats,
      status: getStatusLabel(registration.status),
      paymentStatus: getPaymentLabel(registration.paymentStatus),
      notes: registration.notes || '',
      createdAt: registration.createdAt
    }
  })

  exportRowsToCsv(
    'inscricoes-evento-ccd-fiolhais.csv',
    [
      { key: 'fullName', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Telefone' },
      { key: 'memberNumber', label: 'Número de sócio' },
      { key: 'seats', label: 'Lugares' },
      { key: 'status', label: 'Estado da inscrição' },
      { key: 'paymentStatus', label: 'Pagamento' },
      { key: 'notes', label: 'Observações' },
      { key: 'createdAt', label: 'Data de inscrição' }
    ],
    rows
  )
}

watch(
  () => props.eventId,
  async () => {
    await loadRegistrations()
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div class="rounded-3xl border border-amber-200 bg-white shadow-sm">
    <div class="border-b border-gray-200 p-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-950">
            Inscrições
          </h2>

          <p class="mt-2 text-gray-600">
            Gere participantes e pagamentos deste evento.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-xl border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700"
            @click="handleReload"
          >
            Recarregar
          </button>

          <button
            type="button"
            class="rounded-xl border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700"
            @click="handleExport"
          >
            Exportar CSV
          </button>
        </div>
      </div>
    </div>

    <div class="grid gap-4 border-b border-gray-200 p-6 md:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Inscrições"
        :value="totalRegistrations"
        description="Registos recebidos"
      />

      <AdminStatCard
        label="Lugares"
        :value="totalSeats"
        description="Sem cancelados"
      />

      <AdminStatCard
        label="Pagamentos"
        :value="paidRegistrations"
        description="Pagos"
      />

      <AdminStatCard
        label="Pendentes"
        :value="pendingPayments"
        description="Pagamentos por confirmar"
      />
    </div>

    <div
      v-if="submitError"
      class="m-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
    >
      {{ submitError }}
    </div>

    <div
      v-if="successMessage"
      class="m-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
    >
      {{ successMessage }}
    </div>

    <div class="grid gap-4 border-b border-gray-200 p-6 xl:grid-cols-[1fr_220px_220px]">
      <input
        v-model="searchTerm"
        type="search"
        placeholder="Pesquisar participante..."
        class="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950"
      >

      <select
        v-model="selectedStatus"
        class="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950"
      >
        <option
          v-for="status in statusOptions"
          :key="status.value"
          :value="status.value"
        >
          {{ status.label }}
        </option>
      </select>

      <select
        v-model="selectedPayment"
        class="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950"
      >
        <option
          v-for="payment in paymentOptions"
          :key="payment.value"
          :value="payment.value"
        >
          {{ payment.label }}
        </option>
      </select>
    </div>

    <div
      v-if="isLoading"
      class="p-8 text-center text-gray-600"
    >
      A carregar inscrições...
    </div>

    <div
      v-else-if="filteredRegistrations.length"
      class="divide-y divide-gray-200"
    >
      <article
        v-for="registration in filteredRegistrations"
        :key="registration.id"
        class="p-6"
      >
        <div class="flex flex-col gap-5 xl:flex-row xl:justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-950">
              {{ registration.fullName }}
            </h3>

            <p class="mt-1 text-sm text-gray-600">
              {{ registration.email }} · {{ registration.phone }}
            </p>

            <p class="mt-1 text-sm text-gray-500">
              {{ registration.seats }} lugar(es)
              <span v-if="registration.memberNumber">
                · Sócio nº {{ registration.memberNumber }}
              </span>
            </p>

            <p class="mt-1 text-sm text-gray-500">
              Inscrição: {{ formatDateTime(registration.createdAt) }}
            </p>

            <p
              v-if="registration.notes"
              class="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700"
            >
              {{ registration.notes }}
            </p>
          </div>

          <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <button
                v-if="registration.status !== 'confirmed'"
                type="button"
                class="rounded-xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700"
                :disabled="isSubmitting"
                @click="handleRegistrationStatus(registration.id, 'confirmed')"
              >
                Confirmar
              </button>

              <button
                v-if="registration.status !== 'cancelled'"
                type="button"
                class="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700"
                :disabled="isSubmitting"
                @click="handleRegistrationStatus(registration.id, 'cancelled')"
              >
                Cancelar inscrição
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-if="registration.paymentStatus !== 'paid'"
                type="button"
                class="rounded-xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700"
                :disabled="isSubmitting"
                @click="handlePaymentStatus(registration.id, 'paid')"
              >
                Marcar pago
              </button>

              <button
                v-if="registration.paymentStatus !== 'pending'"
                type="button"
                class="rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700"
                :disabled="isSubmitting"
                @click="handlePaymentStatus(registration.id, 'pending')"
              >
                Pagamento pendente
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <SharedEmptyState
      v-else
      class="m-6"
      icon="🎟️"
      title="Nenhuma inscrição encontrada"
      description="Este evento ainda não recebeu inscrições ou os filtros não têm resultados."
    />
  </div>
</template>