<script setup lang="ts">
import {
  useSupabaseAdminEventRegistrations,
  type AdminEventRegistration,
  type AdminRegistrationPaymentStatus,
  type AdminRegistrationStatus
} from '~/composables/useSupabaseAdminEventRegistrations'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Inscrições em Eventos'
})

type RegistrationStatusFilter =
  | 'all'
  | AdminRegistrationStatus

type PaymentStatusFilter =
  | 'all'
  | AdminRegistrationPaymentStatus

const {
  getAllRegistrations,
  updateRegistrationStatus,
  updatePaymentStatus
} = useSupabaseAdminEventRegistrations()

const registrations =
  ref<AdminEventRegistration[]>([])

const searchTerm = ref('')

const selectedEventId =
  ref('all')

const selectedRegistrationStatus =
  ref<RegistrationStatusFilter>('all')

const selectedPaymentStatus =
  ref<PaymentStatusFilter>('all')

const isLoading = ref(true)

const updatingRegistrationId =
  ref<string | null>(null)

const submitError = ref('')
const successMessage = ref('')

const registrationStatusOptions: Array<{
  label: string
  value: RegistrationStatusFilter
}> = [
  {
    label: 'Todos os estados',
    value: 'all'
  },
  {
    label: 'Pendentes',
    value: 'pending'
  },
  {
    label: 'Confirmadas',
    value: 'confirmed'
  },
  {
    label: 'Canceladas',
    value: 'cancelled'
  }
]

const paymentStatusOptions: Array<{
  label: string
  value: PaymentStatusFilter
}> = [
  {
    label: 'Todos os pagamentos',
    value: 'all'
  },
  {
    label: 'Pendentes',
    value: 'pending'
  },
  {
    label: 'Pagos',
    value: 'paid'
  },
  {
    label: 'Cancelados',
    value: 'cancelled'
  }
]

const eventOptions = computed(() => {
  const events = new Map<
    string,
    string
  >()

  registrations.value.forEach(
    (registration) => {
      events.set(
        registration.eventId,
        registration.eventTitle
      )
    }
  )

  return [
    {
      value: 'all',
      label: 'Todos os eventos'
    },
    ...Array.from(
      events.entries()
    )
      .map(
        ([
          value,
          label
        ]) => {
          return {
            value,
            label
          }
        }
      )
      .sort(
        (
          firstEvent,
          secondEvent
        ) => {
          return firstEvent.label.localeCompare(
            secondEvent.label,
            'pt'
          )
        }
      )
  ]
})

const getRegistrationStatusLabel = (
  status: AdminRegistrationStatus
) => {
  if (status === 'confirmed') {
    return 'Confirmada'
  }

  if (status === 'cancelled') {
    return 'Cancelada'
  }

  return 'Pendente'
}

const getRegistrationStatusClass = (
  status: AdminRegistrationStatus
) => {
  if (status === 'confirmed') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'cancelled') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  return 'border-amber-200 bg-amber-50 text-amber-800'
}

const getPaymentStatusLabel = (
  status:
    AdminRegistrationPaymentStatus
) => {
  if (status === 'paid') {
    return 'Pago'
  }

  if (status === 'cancelled') {
    return 'Cancelado'
  }

  return 'Pendente'
}

const getPaymentStatusClass = (
  status:
    AdminRegistrationPaymentStatus
) => {
  if (status === 'paid') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'cancelled') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  return 'border-amber-200 bg-amber-50 text-amber-800'
}

const formatDateTime = (
  value: string
) => {
  return new Intl.DateTimeFormat(
    'pt-PT',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  ).format(
    new Date(value)
  )
}

const formatEventDate = (
  registration:
    AdminEventRegistration
) => {
  if (!registration.eventDate) {
    return registration.eventDateLabel
  }

  return new Intl.DateTimeFormat(
    'pt-PT',
    {
      dateStyle: 'long'
    }
  ).format(
    new Date(
      `${registration.eventDate}T00:00:00`
    )
  )
}

const totalRegistrations = computed(() => {
  return registrations.value.length
})

const activeRegistrations = computed(() => {
  return registrations.value.filter(
    (registration) => {
      return (
        registration.status !==
        'cancelled'
      )
    }
  ).length
})

const reservedSeats = computed(() => {
  return registrations.value
    .filter(
      (registration) => {
        return (
          registration.status !==
          'cancelled'
        )
      }
    )
    .reduce(
      (
        total,
        registration
      ) => {
        return (
          total +
          registration.seats
        )
      },
      0
    )
})

const pendingPayments = computed(() => {
  return registrations.value.filter(
    (registration) => {
      return (
        registration.status !==
          'cancelled' &&
        registration.paymentStatus ===
          'pending'
      )
    }
  ).length
})

const filteredRegistrations = computed(
  () => {
    const searchValue =
      searchTerm.value
        .trim()
        .toLowerCase()

    return registrations.value.filter(
      (registration) => {
        const matchesSearch = [
          registration.fullName,
          registration.email,
          registration.phone,
          registration.memberNumber ||
            '',
          registration.eventTitle,
          registration.notes || ''
        ]
          .join(' ')
          .toLowerCase()
          .includes(searchValue)

        const matchesEvent =
          selectedEventId.value ===
            'all' ||
          registration.eventId ===
            selectedEventId.value

        const matchesRegistrationStatus =
          selectedRegistrationStatus.value ===
            'all' ||
          registration.status ===
            selectedRegistrationStatus.value

        const matchesPaymentStatus =
          selectedPaymentStatus.value ===
            'all' ||
          registration.paymentStatus ===
            selectedPaymentStatus.value

        return (
          matchesSearch &&
          matchesEvent &&
          matchesRegistrationStatus &&
          matchesPaymentStatus
        )
      }
    )
  }
)

const loadRegistrations = async (
  clearFeedback = true
) => {
  isLoading.value = true

  if (clearFeedback) {
    submitError.value = ''
    successMessage.value = ''
  }

  const result =
    await getAllRegistrations()

  isLoading.value = false

  if (!result.success) {
    submitError.value =
      result.error ||
      'Não foi possível carregar as inscrições.'

    return
  }

  registrations.value =
    result.registrations
}

const updateLocalRegistrationStatus = (
  registrationId: string,
  status: AdminRegistrationStatus
) => {
  registrations.value =
    registrations.value.map(
      (registration) => {
        if (
          registration.id !==
          registrationId
        ) {
          return registration
        }

        return {
          ...registration,
          status
        }
      }
    )
}

const updateLocalPaymentStatus = (
  registrationId: string,
  paymentStatus:
    AdminRegistrationPaymentStatus
) => {
  registrations.value =
    registrations.value.map(
      (registration) => {
        if (
          registration.id !==
          registrationId
        ) {
          return registration
        }

        return {
          ...registration,
          paymentStatus
        }
      }
    )
}

const handleRegistrationStatus =
  async (
    registrationId: string,
    status:
      AdminRegistrationStatus
  ) => {
    submitError.value = ''
    successMessage.value = ''

    updatingRegistrationId.value =
      registrationId

    const result =
      await updateRegistrationStatus(
        registrationId,
        status
      )

    updatingRegistrationId.value =
      null

    if (!result.success) {
      submitError.value =
        result.error ||
        'Não foi possível atualizar a inscrição.'

      return
    }

    updateLocalRegistrationStatus(
      registrationId,
      status
    )

    if (status === 'confirmed') {
      successMessage.value =
        'Inscrição confirmada com sucesso.'

      return
    }

    if (status === 'cancelled') {
      successMessage.value =
        'Inscrição cancelada.'

      return
    }

    successMessage.value =
      'Inscrição marcada como pendente.'
  }

const handlePaymentStatus =
  async (
    registrationId: string,
    paymentStatus:
      AdminRegistrationPaymentStatus
  ) => {
    submitError.value = ''
    successMessage.value = ''

    updatingRegistrationId.value =
      registrationId

    const result =
      await updatePaymentStatus(
        registrationId,
        paymentStatus
      )

    updatingRegistrationId.value =
      null

    if (!result.success) {
      submitError.value =
        result.error ||
        'Não foi possível atualizar o pagamento.'

      return
    }

    updateLocalPaymentStatus(
      registrationId,
      paymentStatus
    )

    if (
      paymentStatus === 'paid'
    ) {
      successMessage.value =
        'Pagamento marcado como pago.'

      return
    }

    if (
      paymentStatus ===
      'cancelled'
    ) {
      successMessage.value =
        'Pagamento cancelado.'

      return
    }

    successMessage.value =
      'Pagamento marcado como pendente.'
  }

const handleReload = async () => {
  await loadRegistrations()
}

onMounted(async () => {
  await loadRegistrations()
})
</script>

<template>
  <UContainer class="py-8">
    <div
      class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div>
        <p
          class="text-sm font-semibold uppercase tracking-wide text-amber-600"
        >
          Administração
        </p>

        <h1
          class="mt-2 text-3xl font-bold text-gray-950"
        >
          Inscrições em eventos
        </h1>

        <p
          class="mt-2 text-gray-600"
        >
          Consulta e gere as inscrições,
          lugares e pagamentos dos eventos.
        </p>
      </div>

      <button
        type="button"
        class="rounded-xl border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isLoading"
        @click="handleReload"
      >
        Recarregar inscrições
      </button>
    </div>

    <div
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      <AdminStatCard
        label="Total"
        :value="totalRegistrations"
        description="Inscrições registadas"
      />

      <AdminStatCard
        label="Ativas"
        :value="activeRegistrations"
        description="Não canceladas"
      />

      <AdminStatCard
        label="Lugares"
        :value="reservedSeats"
        description="Lugares reservados"
      />

      <AdminStatCard
        label="Pagamentos"
        :value="pendingPayments"
        description="Pagamentos pendentes"
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

    <section
      class="mt-8 rounded-3xl border border-amber-200 bg-white shadow-sm"
    >
      <div
        class="border-b border-gray-200 p-6"
      >
        <div
          class="grid gap-4 xl:grid-cols-[1fr_240px_220px_220px]"
        >
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Pesquisar participante, email, telefone ou nº de sócio..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >

          <select
            v-model="selectedEventId"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option
              v-for="event in eventOptions"
              :key="event.value"
              :value="event.value"
            >
              {{ event.label }}
            </option>
          </select>

          <select
            v-model="selectedRegistrationStatus"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option
              v-for="status in registrationStatusOptions"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>

          <select
            v-model="selectedPaymentStatus"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option
              v-for="status in paymentStatusOptions"
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
          <div
            class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"
          >
            <div>
              <div
                class="flex flex-wrap items-center gap-3"
              >
                <h2
                  class="text-xl font-bold text-gray-950"
                >
                  {{ registration.fullName }}
                </h2>

                <span
                  class="rounded-full border px-3 py-1 text-xs font-bold"
                  :class="
                    getRegistrationStatusClass(
                      registration.status
                    )
                  "
                >
                  {{
                    getRegistrationStatusLabel(
                      registration.status
                    )
                  }}
                </span>

                <span
                  class="rounded-full border px-3 py-1 text-xs font-bold"
                  :class="
                    getPaymentStatusClass(
                      registration.paymentStatus
                    )
                  "
                >
                  Pagamento:
                  {{
                    getPaymentStatusLabel(
                      registration.paymentStatus
                    )
                  }}
                </span>
              </div>

              <p
                class="mt-2 text-sm text-gray-500"
              >
                Inscrição efetuada em
                {{
                  formatDateTime(
                    registration.createdAt
                  )
                }}
              </p>
            </div>

            <div
              class="flex flex-wrap gap-2"
            >
              <button
                v-if="
                  registration.status ===
                  'pending'
                "
                type="button"
                class="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="
                  updatingRegistrationId ===
                  registration.id
                "
                @click="
                  handleRegistrationStatus(
                    registration.id,
                    'confirmed'
                  )
                "
              >
                Confirmar
              </button>

              <button
                v-if="
                  registration.status ===
                  'confirmed'
                "
                type="button"
                class="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="
                  updatingRegistrationId ===
                  registration.id
                "
                @click="
                  handleRegistrationStatus(
                    registration.id,
                    'pending'
                  )
                "
              >
                Marcar pendente
              </button>

              <button
                v-if="
                  registration.status !==
                  'cancelled'
                "
                type="button"
                class="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="
                  updatingRegistrationId ===
                  registration.id
                "
                @click="
                  handleRegistrationStatus(
                    registration.id,
                    'cancelled'
                  )
                "
              >
                Cancelar inscrição
              </button>

              <button
                v-if="
                  registration.status ===
                  'cancelled'
                "
                type="button"
                class="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="
                  updatingRegistrationId ===
                  registration.id
                "
                @click="
                  handleRegistrationStatus(
                    registration.id,
                    'pending'
                  )
                "
              >
                Reabrir inscrição
              </button>
            </div>
          </div>

          <div
            class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <div
              class="rounded-2xl bg-gray-50 p-4"
            >
              <p
                class="text-sm font-semibold text-gray-500"
              >
                Evento
              </p>

              <p
                class="mt-1 font-bold text-gray-950"
              >
                {{ registration.eventTitle }}
              </p>

              <NuxtLink
                v-if="registration.eventSlug"
                :to="`/admin/eventos/${registration.eventSlug}`"
                class="mt-2 inline-block text-sm font-semibold text-amber-700 hover:text-amber-600"
              >
                Ver evento
              </NuxtLink>
            </div>

            <div
              class="rounded-2xl bg-gray-50 p-4"
            >
              <p
                class="text-sm font-semibold text-gray-500"
              >
                Data e local
              </p>

              <p
                class="mt-1 text-gray-950"
              >
                {{ formatEventDate(registration) }}
              </p>

              <p
                class="mt-1 text-sm text-gray-600"
              >
                {{ registration.eventLocation }}
              </p>
            </div>

            <div
              class="rounded-2xl bg-gray-50 p-4"
            >
              <p
                class="text-sm font-semibold text-gray-500"
              >
                Lugares
              </p>

              <p
                class="mt-1 text-2xl font-black text-gray-950"
              >
                {{ registration.seats }}
              </p>
            </div>

            <div
              class="rounded-2xl bg-gray-50 p-4"
            >
              <p
                class="text-sm font-semibold text-gray-500"
              >
                Sócio
              </p>

              <template
                v-if="registration.memberNumber"
              >
                <p
                  class="mt-1 font-bold text-gray-950"
                >
                  Nº {{ registration.memberNumber }}
                </p>

                <NuxtLink
                  :to="`/admin/socios/${registration.memberNumber}`"
                  class="mt-2 inline-block text-sm font-semibold text-amber-700 hover:text-amber-600"
                >
                  Ver sócio
                </NuxtLink>
              </template>

              <p
                v-else
                class="mt-1 text-gray-600"
              >
                Não associado
              </p>
            </div>
          </div>

          <div
            class="mt-4 grid gap-4 md:grid-cols-2"
          >
            <div
              class="rounded-2xl bg-gray-50 p-4"
            >
              <p
                class="text-sm font-semibold text-gray-500"
              >
                Email
              </p>

              <a
                :href="`mailto:${registration.email}`"
                class="mt-1 block break-all font-medium text-amber-700 hover:text-amber-600"
              >
                {{ registration.email }}
              </a>
            </div>

            <div
              class="rounded-2xl bg-gray-50 p-4"
            >
              <p
                class="text-sm font-semibold text-gray-500"
              >
                Telefone
              </p>

              <a
                :href="`tel:${registration.phone}`"
                class="mt-1 block font-medium text-amber-700 hover:text-amber-600"
              >
                {{ registration.phone }}
              </a>
            </div>
          </div>

          <div
            v-if="registration.notes"
            class="mt-4 rounded-2xl bg-gray-50 p-4"
          >
            <p
              class="text-sm font-semibold text-gray-500"
            >
              Observações
            </p>

            <p
              class="mt-2 whitespace-pre-line text-gray-800"
            >
              {{ registration.notes }}
            </p>
          </div>

          <div
            class="mt-5 rounded-2xl border border-gray-200 p-4"
          >
            <p
              class="font-bold text-gray-950"
            >
              Gestão do pagamento
            </p>

            <div
              class="mt-3 flex flex-wrap gap-2"
            >
              <button
                v-if="
                  registration.paymentStatus !==
                  'paid'
                "
                type="button"
                class="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="
                  updatingRegistrationId ===
                  registration.id
                "
                @click="
                  handlePaymentStatus(
                    registration.id,
                    'paid'
                  )
                "
              >
                Marcar como pago
              </button>

              <button
                v-if="
                  registration.paymentStatus !==
                  'pending'
                "
                type="button"
                class="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="
                  updatingRegistrationId ===
                  registration.id
                "
                @click="
                  handlePaymentStatus(
                    registration.id,
                    'pending'
                  )
                "
              >
                Marcar pagamento pendente
              </button>

              <button
                v-if="
                  registration.paymentStatus !==
                  'cancelled'
                "
                type="button"
                class="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="
                  updatingRegistrationId ===
                  registration.id
                "
                @click="
                  handlePaymentStatus(
                    registration.id,
                    'cancelled'
                  )
                "
              >
                Cancelar pagamento
              </button>
            </div>
          </div>
        </article>
      </div>

      <SharedEmptyState
        v-else
        class="m-6"
        icon="🎟️"
        title="Nenhuma inscrição encontrada"
        description="Ainda não existem inscrições ou os filtros selecionados não têm resultados."
      />
    </section>
  </UContainer>
</template>