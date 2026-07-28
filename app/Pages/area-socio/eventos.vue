<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'
import { useMemberSession } from '~/composables/useMemberSession'
import type { EventRegistrationStatus } from '~/types/event'

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const { currentMember, isLoggedIn } = useMemberSession()
const { getEvents, registrations } = useEvents()

const events = getEvents()

const memberRegistrations = computed(() => {
  if (!currentMember.value) {
    return []
  }

  return registrations.value
    .filter((registration) => {
      return registration.email.toLowerCase() === currentMember.value?.email.toLowerCase()
    })
    .map((registration) => {
      const event = events.find((item) => item.id === registration.eventId)

      return {
        registration,
        event
      }
    })
    .filter((item) => item.event)
})

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
</script>

<template>
  <UContainer class="py-12">
    <div class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">
        Área do Sócio
      </p>

      <h1 class="mt-2 text-4xl font-bold text-gray-950">
        Os meus eventos
      </h1>

      <p class="mt-3 text-gray-600">
        Consulta as inscrições em eventos associadas ao teu email.
      </p>
    </div>

    <UCard v-if="!isLoggedIn">
      <h2 class="text-xl font-bold text-gray-950">
        Tens de entrar primeiro.
      </h2>

      <p class="mt-2 text-gray-600">
        Entra na área do sócio para consultar os teus eventos.
      </p>

      <UButton
        to="/area-socio"
        class="mt-5"
      >
        Entrar na área do sócio
      </UButton>
    </UCard>

    <div
      v-else
      class="space-y-8"
    >
      <PublicMemberAreaNav />

      <UCard>
        <template #header>
          <h2 class="text-xl font-bold text-gray-950">
            Inscrições em eventos
          </h2>
        </template>

        <div
          v-if="memberRegistrations.length"
          class="space-y-4"
        >
          <div
            v-for="item in memberRegistrations"
            :key="item.registration.id"
            class="rounded-xl border border-gray-200 p-4"
          >
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="font-semibold text-gray-950">
                  {{ item.event?.title }}
                </p>

                <p class="mt-1 text-sm text-gray-600">
                  {{ item.event?.date }} · {{ item.event?.time }} · {{ item.event?.location }}
                </p>

                <p class="mt-1 text-sm text-gray-500">
                  {{ item.registration.quantity }} lugar(es) · {{ item.registration.totalAmount }}€
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <UBadge
                  :color="getPaymentColor(item.registration.paymentStatus)"
                  variant="soft"
                >
                  {{ getPaymentLabel(item.registration.paymentStatus) }}
                </UBadge>

                <UButton
                  :to="`/agenda/${item.event?.slug}`"
                  size="sm"
                  variant="outline"
                >
                  Ver evento
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="py-10 text-center"
        >
          <p class="font-medium text-gray-950">
            Ainda não existem inscrições associadas a este sócio.
          </p>

          <p class="mt-1 text-sm text-gray-500">
            Para testar, faz uma inscrição pública num evento usando o email deste sócio.
          </p>

          <UButton
            to="/agenda"
            class="mt-5"
          >
            Ver agenda
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>