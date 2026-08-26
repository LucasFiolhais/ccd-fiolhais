<script setup lang="ts">
import { exportRowsToCsv } from '~/utils/exportCsv'
import { useEvents } from '~/composables/useEvents'
import type { EventRegistrationStatus, EventStatus } from '~/types/event'

definePageMeta({
  layout: 'admin'
})

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const route = useRoute()

const {
  getEventBySlug,
  getRegistrationsByEventSlug,
  getEventRegisteredCount,
  markRegistrationAsPaid,
  cancelRegistration
} = useEvents()

const event = computed(() => {
  return getEventBySlug(String(route.params.slug))
})

const registrations = computed(() => {
  return getRegistrationsByEventSlug(String(route.params.slug))
})

const paidRegistrations = computed(() => {
  return registrations.value.filter((registration) => registration.paymentStatus === 'paid').length
})

const pendingRegistrations = computed(() => {
  return registrations.value.filter((registration) => registration.paymentStatus === 'pending').length
})

const occupiedSeats = computed(() => {
  if (!event.value) {
    return 0
  }

  return getEventRegisteredCount(event.value.id)
})

const getStatusLabel = (status: EventStatus) => {
  if (status === 'open') return 'Aberto'
  if (status === 'soon') return 'Em breve'
  if (status === 'sold_out') return 'Esgotado'

  return 'Fechado'
}

const getStatusColor = (status: EventStatus): BadgeColor => {
  if (status === 'open') return 'success'
  if (status === 'soon') return 'warning'
  if (status === 'sold_out') return 'error'

  return 'neutral'
}

const getPaymentLabel = (status: EventRegistrationStatus) => {
  if (status === 'paid') return 'Pago'
  if (status === 'pending') return 'Pendente'

  return 'Cancelado'
}

const getPaymentColor = (status: EventRegistrationStatus): BadgeColor => {
  if (status === 'paid') return 'success'
  if (status === 'pending') return 'warning'

  return 'neutral'
}

const handleMarkAsPaid = (registrationId: number) => {
  markRegistrationAsPaid(registrationId)
}

const handleCancelRegistration = (registrationId: number) => {
  cancelRegistration(registrationId)
}

const handleExportRegistrations = () => {
  if (!event.value) {
    return
  }

  const rows = registrations.value.map((registration) => {
    return {
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      quantity: registration.quantity,
      isMember: registration.isMember ? 'Sócio' : 'Não sócio',
      totalAmount: `${registration.totalAmount}€`,
      paymentStatus: getPaymentLabel(registration.paymentStatus),
      registeredAt: registration.registeredAt,
      notes: registration.notes || ''
    }
  })

  exportRowsToCsv(
    `inscritos-${event.value.slug}.csv`,
    [
      {
        key: 'name',
        label: 'Nome'
      },
      {
        key: 'email',
        label: 'Email'
      },
      {
        key: 'phone',
        label: 'Telefone'
      },
      {
        key: 'quantity',
        label: 'Lugares'
      },
      {
        key: 'isMember',
        label: 'Tipo'
      },
      {
        key: 'totalAmount',
        label: 'Valor'
      },
      {
        key: 'paymentStatus',
        label: 'Pagamento'
      },
      {
        key: 'registeredAt',
        label: 'Data de inscrição'
      },
      {
        key: 'notes',
        label: 'Observações'
      }
    ],
    rows
  )
}

</script>

<template>
  <UContainer class="py-10">
    <UButton
      to="/admin/eventos"
      variant="link"
      class="mb-6 px-0"
    >
      ← Voltar aos eventos
    </UButton>

    <div
      v-if="event"
      class="space-y-8"
    >
      <UCard>
        <template #header>
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div class="flex gap-4">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
                {{ event.imageEmoji }}
              </div>

              <div>
                <p class="text-sm font-semibold uppercase tracking-wide text-primary">
                  {{ event.category }}
                </p>

                <h1 class="mt-2 text-3xl font-bold text-gray-950">
                  {{ event.title }}
                </h1>

                <p class="mt-2 text-gray-600">
                  {{ event.date }} · {{ event.time }} · {{ event.location }}
                </p>
              </div>
            </div>

            <UBadge
              :color="getStatusColor(event.status)"
              variant="soft"
            >
              {{ getStatusLabel(event.status) }}
            </UBadge>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-4">
          <div class="rounded-xl bg-gray-50 p-4">
            <p class="text-sm text-gray-500">
              Capacidade
            </p>

            <p class="mt-2 text-2xl font-bold text-gray-950">
              {{ occupiedSeats }} / {{ event.capacity }}
            </p>
          </div>

          <div class="rounded-xl bg-gray-50 p-4">
            <p class="text-sm text-gray-500">
              Inscrições pagas
            </p>

            <p class="mt-2 text-2xl font-bold text-gray-950">
              {{ paidRegistrations }}
            </p>
          </div>

          <div class="rounded-xl bg-gray-50 p-4">
            <p class="text-sm text-gray-500">
              Pendentes
            </p>

            <p class="mt-2 text-2xl font-bold text-gray-950">
              {{ pendingRegistrations }}
            </p>
          </div>

          <div class="rounded-xl bg-gray-50 p-4">
            <p class="text-sm text-gray-500">
              Preço sócio
            </p>

            <p class="mt-2 text-2xl font-bold text-gray-950">
              {{ event.priceMember }}
            </p>
          </div>
        </div>

        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UButton>
              Editar evento
            </UButton>

            <UButton
              :to="`/agenda/${event.slug}`"
              variant="outline"
            >
              Ver página pública
            </UButton>
          </div>
        </template>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-950">
                Lista de inscritos
              </h2>

              <p class="mt-1 text-sm text-gray-600">
                Consulta inscrições, lugares reservados e estado do pagamento.
              </p>
            </div>

              <UButton
                variant="outline"
                @click="handleExportRegistrations"
              >
                Exportar lista
              </UButton>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr class="text-left text-gray-500">
                <th class="px-4 py-3 font-medium">
                  Nome
                </th>

                <th class="px-4 py-3 font-medium">
                  Contacto
                </th>

                <th class="px-4 py-3 font-medium">
                  Lugares
                </th>

                <th class="px-4 py-3 font-medium">
                  Valor
                </th>

                <th class="px-4 py-3 font-medium">
                  Estado
                </th>

                <th class="px-4 py-3 text-right font-medium">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="registration in registrations"
                :key="registration.id"
              >
                <td class="px-4 py-4">
                  <p class="font-medium text-gray-950">
                    {{ registration.name }}
                  </p>

                  <p class="text-xs text-gray-500">
                    {{ registration.isMember ? 'Sócio' : 'Não sócio' }}
                    · inscrito em {{ registration.registeredAt }}
                  </p>

                  <p
                    v-if="registration.notes"
                    class="mt-1 text-xs text-gray-500"
                  >
                    {{ registration.notes }}
                  </p>
                </td>

                <td class="px-4 py-4 text-gray-700">
                  <p>{{ registration.email }}</p>
                  <p class="text-xs text-gray-500">{{ registration.phone }}</p>
                </td>

                <td class="px-4 py-4 text-gray-700">
                  {{ registration.quantity }}
                </td>

                <td class="px-4 py-4 text-gray-700">
                  {{ registration.totalAmount }}€
                </td>

                <td class="px-4 py-4">
                  <UBadge
                    :color="getPaymentColor(registration.paymentStatus)"
                    variant="soft"
                  >
                    {{ getPaymentLabel(registration.paymentStatus) }}
                  </UBadge>
                </td>

                <td class="px-4 py-4">
                  <div class="flex justify-end gap-2">
                    <UButton
                      v-if="registration.paymentStatus === 'pending'"
                      size="sm"
                      variant="outline"
                      @click="handleMarkAsPaid(registration.id)"
                    >
                      Marcar pago
                    </UButton>

                    <UButton
                      v-if="registration.paymentStatus !== 'cancelled'"
                      size="sm"
                      color="neutral"
                      variant="soft"
                      @click="handleCancelRegistration(registration.id)"
                    >
                      Cancelar
                    </UButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="!registrations.length"
          class="py-10 text-center"
        >
          <p class="font-medium text-gray-950">
            Ainda não existem inscrições.
          </p>

          <p class="mt-1 text-sm text-gray-500">
            Quando houver inscrições, vão aparecer aqui.
          </p>
        </div>
      </UCard>
    </div>

    <UCard
      v-else
      class="text-center"
    >
      <h1 class="text-2xl font-bold text-gray-950">
        Evento não encontrado
      </h1>

      <p class="mt-2 text-gray-600">
        O evento indicado não existe.
      </p>

      <UButton
        to="/admin/eventos"
        class="mt-6"
      >
        Voltar aos eventos
      </UButton>
    </UCard>
  </UContainer>
</template>