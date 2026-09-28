<script setup lang="ts">
import { useSupabaseMemberAuth } from '~/composables/useSupabaseMemberAuth'
import {
  useSupabaseMemberArea,
  type MemberAreaEventRegistration,
  type MemberAreaPaymentStatus,
  type MemberAreaRegistrationStatus
} from '~/composables/useSupabaseMemberArea'

const {
  isLoggedIn,
  loadMemberUser
} = useSupabaseMemberAuth()

const {
  getMyEventRegistrations
} = useSupabaseMemberArea()

useHead({
  title: 'Os Meus Eventos'
})

const registrations = ref<MemberAreaEventRegistration[]>([])

const isLoading = ref(true)
const loadError = ref('')

const getRegistrationStatusLabel = (
  status: MemberAreaRegistrationStatus
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
  status: MemberAreaRegistrationStatus
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
  status: MemberAreaPaymentStatus
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
  status: MemberAreaPaymentStatus
) => {
  if (status === 'paid') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'cancelled') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  return 'border-amber-200 bg-amber-50 text-amber-800'
}

const formatEventDate = (
  registration: MemberAreaEventRegistration
) => {
  if (!registration.eventDate) {
    return registration.eventDateLabel
  }

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'long'
  }).format(
    new Date(`${registration.eventDate}T00:00:00`)
  )
}

const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value))
}

const activeRegistrations = computed(() => {
  return registrations.value.filter((registration) => {
    return registration.status !== 'cancelled'
  }).length
})

const totalSeats = computed(() => {
  return registrations.value
    .filter((registration) => {
      return registration.status !== 'cancelled'
    })
    .reduce((total, registration) => {
      return total + registration.seats
    }, 0)
})

const pendingPayments = computed(() => {
  return registrations.value.filter((registration) => {
    return (
      registration.status !== 'cancelled' &&
      registration.paymentStatus === 'pending'
    )
  }).length
})

const loadRegistrations = async () => {
  isLoading.value = true
  loadError.value = ''

  await loadMemberUser()

  if (!isLoggedIn.value) {
    isLoading.value = false
    await navigateTo('/socios/login')
    return
  }

  const result =
    await getMyEventRegistrations()

  isLoading.value = false

  if (!result.success) {
    loadError.value =
      result.error ||
      'Não foi possível carregar as inscrições.'

    return
  }

  registrations.value =
    result.registrations
}

onMounted(async () => {
  await loadRegistrations()
})
</script>

<template>
  <section class="min-h-[70vh] bg-[#f8f4ea] py-12">
    <UContainer>
      <div
        v-if="isLoading"
        class="rounded-3xl border border-amber-200 bg-white p-10 text-center text-gray-600 shadow-sm"
      >
        A carregar inscrições...
      </div>

      <div
        v-else-if="loadError"
        class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"
      >
        {{ loadError }}
      </div>

      <div
        v-else
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
            As minhas inscrições
          </h1>

          <p class="mt-2 text-gray-600">
            Consulta as inscrições em eventos associadas à tua conta.
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
            class="rounded-2xl border border-gray-200 bg-white p-4 text-center font-semibold text-gray-700"
          >
            💶 Quotas
          </NuxtLink>

          <NuxtLink
            to="/area-socio/eventos"
            class="rounded-2xl border border-amber-400 bg-amber-50 p-4 text-center font-semibold text-amber-800"
          >
            🎟️ Eventos
          </NuxtLink>
        </nav>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-gray-500">
              Inscrições ativas
            </p>

            <p class="mt-3 text-3xl font-black text-gray-950">
              {{ activeRegistrations }}
            </p>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-gray-500">
              Lugares reservados
            </p>

            <p class="mt-3 text-3xl font-black text-gray-950">
              {{ totalSeats }}
            </p>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-gray-500">
              Pagamentos pendentes
            </p>

            <p class="mt-3 text-3xl font-black text-gray-950">
              {{ pendingPayments }}
            </p>
          </div>
        </div>

        <div
          v-if="registrations.length"
          class="grid gap-6 lg:grid-cols-2"
        >
          <article
            v-for="registration in registrations"
            :key="registration.id"
            class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p class="text-sm font-bold uppercase tracking-wide text-amber-600">
                  Evento
                </p>

                <h2 class="mt-2 text-xl font-bold text-gray-950">
                  {{ registration.eventTitle }}
                </h2>
              </div>

              <span
                class="self-start rounded-full border px-3 py-1 text-xs font-bold"
                :class="getRegistrationStatusClass(registration.status)"
              >
                {{ getRegistrationStatusLabel(registration.status) }}
              </span>
            </div>

            <div class="mt-5 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm">
              <p class="text-gray-700">
                📅 {{ formatEventDate(registration) }}
              </p>

              <p
                v-if="registration.eventTimeLabel"
                class="text-gray-700"
              >
                🕒 {{ registration.eventTimeLabel }}
              </p>

              <p class="text-gray-700">
                📍 {{ registration.eventLocation }}
              </p>

              <p class="text-gray-700">
                🎟️ {{ registration.seats }} lugar(es)
              </p>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-3">
              <span
                class="rounded-full border px-3 py-1 text-xs font-bold"
                :class="getPaymentStatusClass(registration.paymentStatus)"
              >
                Pagamento:
                {{ getPaymentStatusLabel(registration.paymentStatus) }}
              </span>
            </div>

            <p class="mt-4 text-xs text-gray-500">
              Inscrição efetuada em
              {{ formatDateTime(registration.createdAt) }}
            </p>

            <NuxtLink
              v-if="registration.eventSlug"
              :to="`/agenda/${registration.eventSlug}`"
              class="mt-5 inline-flex font-semibold text-amber-700 hover:text-amber-600"
            >
              Ver evento →
            </NuxtLink>
          </article>
        </div>

        <SharedEmptyState
          v-else
          icon="🎟️"
          title="Ainda não tens inscrições"
          description="Quando te inscreveres num evento com a tua conta autenticada, a inscrição aparecerá aqui."
          action-label="Consultar agenda"
          action-to="/agenda"
        />
      </div>
    </UContainer>
  </section>
</template>