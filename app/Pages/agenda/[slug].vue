<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'
import { useSupabaseEvents } from '~/composables/useSupabaseEvents'

const route = useRoute()

const { getEventBySlug } = useEvents()
const { getPublishedEventBySlug } = useSupabaseEvents()

const slug = computed(() => {
  return String(route.params.slug)
})

const {
  data: supabaseEvent,
  pending
} = await useAsyncData(`public-event-${slug.value}`, () => {
  return getPublishedEventBySlug(slug.value)
})

const mockEvent = computed(() => {
  return getEventBySlug(slug.value)
})

const event = computed(() => {
  return supabaseEvent.value || mockEvent.value || null
})

const isUsingSupabase = computed(() => {
  return Boolean(supabaseEvent.value)
})

useHead(() => {
  return {
    title: event.value?.title || 'Evento'
  }
})
</script>

<template>
  <div>
    <section class="bg-gray-50 py-16">
      <UContainer>
        <NuxtLink
          to="/agenda"
          class="text-sm font-semibold text-amber-700 transition hover:text-amber-600"
        >
          ← Voltar à agenda
        </NuxtLink>

        <div
          v-if="pending"
          class="mt-8 rounded-2xl border border-amber-200 bg-white p-8 text-gray-700 shadow-sm"
        >
          A carregar evento...
        </div>

        <div
          v-else-if="event"
          class="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start"
        >
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
              {{ event.category }}
            </p>

            <h1 class="mt-3 text-4xl font-bold text-gray-950">
              {{ event.title }}
            </h1>

            <p class="mt-4 text-lg leading-8 text-gray-700">
              {{ event.description }}
            </p>

            <div
              v-if="isUsingSupabase"
              class="mt-6 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
            >
              Evento carregado da base de dados oficial
            </div>

            <div
              v-else
              class="mt-6 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800"
            >
              Evento de demonstração
            </div>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <div class="flex h-40 items-center justify-center rounded-2xl bg-gray-50 text-6xl">
              {{ event.imageEmoji }}
            </div>

            <div class="mt-6 space-y-4">
              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm text-gray-500">
                  Data
                </p>

                <p class="mt-1 font-semibold text-gray-950">
                  {{ event.date }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm text-gray-500">
                  Hora
                </p>

                <p class="mt-1 font-semibold text-gray-950">
                  {{ event.time }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <p class="text-sm text-gray-500">
                  Local
                </p>

                <p class="mt-1 font-semibold text-gray-950">
                  {{ event.location }}
                </p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-2xl bg-gray-50 p-4">
                  <p class="text-sm text-gray-500">
                    Sócios
                  </p>

                  <p class="mt-1 font-semibold text-gray-950">
                    {{ event.priceMember }}
                  </p>
                </div>

                <div class="rounded-2xl bg-gray-50 p-4">
                  <p class="text-sm text-gray-500">
                    Não sócios
                  </p>

                  <p class="mt-1 font-semibold text-gray-950">
                    {{ event.priceNonMember }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-white p-6 leading-8 text-gray-700 shadow-sm lg:col-span-2">
            <h2 class="text-2xl font-bold text-gray-950">
              Sobre o evento
            </h2>

            <p class="mt-4 whitespace-pre-line">
              {{ event.longDescription }}
            </p>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm lg:col-span-2">
            <h2 class="text-2xl font-bold">
              Inscrições online
            </h2>

            <p class="mt-3 leading-7">
              A ligação das inscrições ao Supabase será implementada na próxima fase.
              Por agora, esta página já consegue carregar eventos publicados da base de dados oficial.
            </p>
          </div>
        </div>

        <SharedEmptyState
          v-else
          class="mt-8"
          icon="📅"
          title="Evento não encontrado"
          description="O evento que procuras não existe, ainda não está publicado ou foi removido."
          action-label="Voltar à agenda"
          action-to="/agenda"
        />
      </UContainer>
    </section>
  </div>
</template>