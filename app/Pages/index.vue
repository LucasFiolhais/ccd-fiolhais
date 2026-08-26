<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'
import { useMembers } from '~/composables/useMembers'
import { usePosts } from '~/composables/usePosts'

const {
  getFeaturedEvents,
  getEventRegisteredCount
} = useEvents()

const {
  getMembers,
  getCurrentQuota
} = useMembers()

const {
  getPublishedPosts
} = usePosts()

const currentYear = new Date().getFullYear()

const events = computed(() => {
  return getFeaturedEvents()
})

const members = computed(() => {
  return getMembers()
})

const publishedPosts = computed(() => {
  return getPublishedPosts()
})

const latestPosts = computed(() => {
  return [...publishedPosts.value]
    .sort((a, b) => {
      return (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt)
    })
    .slice(0, 3)
})

const totalMembers = computed(() => {
  return members.value.length
})

const activeMembers = computed(() => {
  return members.value.filter((member) => member.status === 'active').length
})

const paidQuotas = computed(() => {
  return members.value.filter((member) => {
    return getCurrentQuota(member, currentYear)?.status === 'paid'
  }).length
})

const openEvents = computed(() => {
  return events.value.filter((event) => event.status === 'open').length
})

const totalReservedSeats = computed(() => {
  return events.value.reduce((total, event) => {
    return total + getEventRegisteredCount(event.id)
  }, 0)
})

const benefits = [
  {
    title: 'Apoiar a associação',
    description: 'A tua contribuição ajuda o CCD a manter a atividade, organizar eventos e criar novos momentos de convívio.',
    emoji: '🤝'
  },
  {
    title: 'Preservar tradições',
    description: 'Ser sócio é ajudar a manter vivas as festas, os convívios e os costumes de Fiolhais.',
    emoji: '🌿'
  },
  {
    title: 'Participar mais de perto',
    description: 'A área do sócio permite consultar dados, quotas e inscrições associadas ao teu perfil.',
    emoji: '🎟️'
  }
]
</script>

<template>
  <div>
    <section class="bg-gradient-to-b from-gray-50 to-white">
      <UContainer class="grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-primary">
            Centro Cultural e Desportivo de Fiolhais
          </p>

          <h1 class="mt-4 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
            A casa da comunidade, das tradições e dos eventos de Fiolhais.
          </h1>

          <p class="mt-6 max-w-xl text-lg text-gray-600">
            Uma plataforma para divulgar eventos, gerir sócios, organizar inscrições
            e guardar a memória da nossa terra.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              to="/agenda"
              size="lg"
            >
              Ver agenda
            </UButton>

            <UButton
              to="/socios/aderir"
              size="lg"
              variant="outline"
            >
              Tornar-me sócio
            </UButton>
          </div>
        </div>

        <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="rounded-2xl bg-gray-100 p-8">
            <p class="text-sm font-medium text-gray-500">
              Próximo destaque
            </p>

            <h2 class="mt-3 text-2xl font-bold">
              {{ events[0]?.title || 'Agenda cultural de Fiolhais' }}
            </h2>

            <p class="mt-3 text-gray-600">
              {{ events[0]?.description || 'Consulta os próximos eventos organizados pelo CCD.' }}
            </p>

            <div
              v-if="events[0]"
              class="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2"
            >
              <div class="rounded-xl bg-white p-3">
                <p class="text-gray-500">
                  Data
                </p>

                <p class="font-medium text-gray-950">
                  {{ events[0].date }}
                </p>
              </div>

              <div class="rounded-xl bg-white p-3">
                <p class="text-gray-500">
                  Local
                </p>

                <p class="font-medium text-gray-950">
                  {{ events[0].location }}
                </p>
              </div>
            </div>

            <UButton
              :to="events[0] ? `/agenda/${events[0].slug}` : '/agenda'"
              class="mt-6"
              variant="outline"
            >
              Consultar evento
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <section class="py-12">
      <UContainer>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <UCard>
            <p class="text-sm font-medium text-gray-500">
              Sócios registados
            </p>

            <p class="mt-3 text-3xl font-bold text-gray-950">
              {{ totalMembers }}
            </p>

            <p class="mt-2 text-sm text-gray-500">
              {{ activeMembers }} ativos
            </p>
          </UCard>

          <UCard>
            <p class="text-sm font-medium text-gray-500">
              Quotas pagas
            </p>

            <p class="mt-3 text-3xl font-bold text-gray-950">
              {{ paidQuotas }}
            </p>

            <p class="mt-2 text-sm text-gray-500">
              Ano {{ currentYear }}
            </p>
          </UCard>

          <UCard>
            <p class="text-sm font-medium text-gray-500">
              Eventos em destaque
            </p>

            <p class="mt-3 text-3xl font-bold text-gray-950">
              {{ events.length }}
            </p>

            <p class="mt-2 text-sm text-gray-500">
              {{ openEvents }} com inscrições abertas
            </p>
          </UCard>

          <UCard>
            <p class="text-sm font-medium text-gray-500">
              Lugares reservados
            </p>

            <p class="mt-3 text-3xl font-bold text-gray-950">
              {{ totalReservedSeats }}
            </p>

            <p class="mt-2 text-sm text-gray-500">
              Inscrições em eventos
            </p>
          </UCard>
        </div>
      </UContainer>
    </section>

    <section class="py-20">
      <UContainer>
        <PublicSectionHeader
          eyebrow="Agenda"
          title="Próximos eventos"
          description="Consulta os próximos convívios, festas, jantares e iniciativas organizadas pelo CCD de Fiolhais."
        />

        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <PublicEventCard
            v-for="event in events"
            :key="event.id"
            :title="event.title"
            :date="event.date"
            :description="event.description"
            :location="event.location"
            :price="event.priceMember"
            :status="event.status"
            :to="`/agenda/${event.slug}`"
          />
        </div>

        <div class="mt-10 text-center">
          <UButton
            to="/agenda"
            size="lg"
            variant="outline"
          >
            Ver todos os eventos
          </UButton>
        </div>
      </UContainer>
    </section>

    <section class="bg-gray-50 py-20">
      <UContainer>
        <PublicSectionHeader
          eyebrow="Sócios"
          title="Porque tornar-se sócio?"
          description="Ser sócio é apoiar diretamente a comunidade, as tradições e o futuro do Centro Cultural e Desportivo de Fiolhais."
        />

        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <UCard
            v-for="benefit in benefits"
            :key="benefit.title"
            class="h-full"
          >
            <div class="text-4xl">
              {{ benefit.emoji }}
            </div>

            <h3 class="mt-5 text-lg font-bold text-gray-950">
              {{ benefit.title }}
            </h3>

            <p class="mt-3 text-sm text-gray-600">
              {{ benefit.description }}
            </p>
          </UCard>
        </div>

        <div class="mt-10 text-center">
          <UButton
            to="/socios/aderir"
            size="lg"
          >
            Tornar-me sócio
          </UButton>
        </div>
      </UContainer>
    </section>

    <section class="py-20">
      <UContainer>
        <PublicSectionHeader
          eyebrow="Memórias"
          title="Últimas publicações do mural"
          description="Fotografias, vídeos, rescaldos e memórias dos eventos da nossa comunidade."
        />

        <div
          v-if="latestPosts.length"
          class="mt-12 grid gap-6 md:grid-cols-3"
        >
          <PublicMuralCard
            v-for="post in latestPosts"
            :key="post.id"
            :title="post.title"
            :category="post.category"
            :description="post.excerpt"
            :emoji="post.coverEmoji"
            :to="`/mural/${post.slug}`"
          />
        </div>

        <UCard
          v-else
          class="mt-12 text-center"
        >
          <p class="font-medium text-gray-950">
            Ainda não existem publicações no mural.
          </p>

          <p class="mt-2 text-sm text-gray-600">
            Quando forem publicadas memórias, vão aparecer aqui.
          </p>
        </UCard>

        <div class="mt-10 text-center">
          <UButton
            to="/mural"
            size="lg"
            variant="outline"
          >
            Visitar o mural
          </UButton>
        </div>
      </UContainer>
    </section>

    <section class="py-20">
      <UContainer>
        <div class="rounded-3xl bg-gray-950 px-6 py-14 text-center text-white sm:px-12">
          <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
            Queres ajudar a manter viva a comunidade de Fiolhais?
          </h2>

          <p class="mx-auto mt-4 max-w-2xl text-gray-300">
            Junta-te ao CCD, participa nos eventos e ajuda a preservar as tradições,
            os encontros e as memórias da nossa terra.
          </p>

          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <UButton
              to="/socios/aderir"
              size="lg"
            >
              Tornar-me sócio
            </UButton>

            <UButton
              to="/agenda"
              size="lg"
              color="neutral"
              variant="outline"
            >
              Ver eventos
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>