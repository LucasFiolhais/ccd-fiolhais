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
          <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
            Centro Cultural e Desportivo de Fiolhais
          </p>

          <h1 class="mt-4 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
            A casa da comunidade, das tradições e dos eventos de Fiolhais.
          </h1>

          <p class="mt-6 max-w-xl text-lg leading-8 text-gray-700">
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

        <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
          <div class="rounded-2xl bg-gray-50 p-8">
            <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
              Próximo destaque
            </p>

            <h2 class="mt-3 text-2xl font-bold text-gray-950">
              {{ events[0]?.title || 'Agenda cultural de Fiolhais' }}
            </h2>

            <p class="mt-3 leading-7 text-gray-700">
              {{ events[0]?.description || 'Consulta os próximos eventos organizados pelo CCD.' }}
            </p>

            <div
              v-if="events[0]"
              class="mt-5 grid gap-3 text-sm sm:grid-cols-2"
            >
              <div class="rounded-xl border border-gray-200 bg-white p-4">
                <p class="text-gray-500">
                  Data
                </p>

                <p class="mt-1 font-semibold text-gray-950">
                  {{ events[0].date }}
                </p>
              </div>

              <div class="rounded-xl border border-gray-200 bg-white p-4">
                <p class="text-gray-500">
                  Local
                </p>

                <p class="mt-1 font-semibold text-gray-950">
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
          <div class="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <div class="mb-5 h-1 w-12 rounded-full ccd-gold-gradient" />

            <p class="text-sm font-medium text-gray-600">
              Sócios registados
            </p>

            <p class="mt-3 text-3xl font-bold text-gray-950">
              {{ totalMembers }}
            </p>

            <p class="mt-2 text-sm text-gray-500">
              {{ activeMembers }} ativos
            </p>
          </div>

          <div class="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <div class="mb-5 h-1 w-12 rounded-full ccd-gold-gradient" />

            <p class="text-sm font-medium text-gray-600">
              Quotas pagas
            </p>

            <p class="mt-3 text-3xl font-bold text-gray-950">
              {{ paidQuotas }}
            </p>

            <p class="mt-2 text-sm text-gray-500">
              Ano {{ currentYear }}
            </p>
          </div>

          <div class="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <div class="mb-5 h-1 w-12 rounded-full ccd-gold-gradient" />

            <p class="text-sm font-medium text-gray-600">
              Eventos em destaque
            </p>

            <p class="mt-3 text-3xl font-bold text-gray-950">
              {{ events.length }}
            </p>

            <p class="mt-2 text-sm text-gray-500">
              {{ openEvents }} com inscrições abertas
            </p>
          </div>

          <div class="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <div class="mb-5 h-1 w-12 rounded-full ccd-gold-gradient" />

            <p class="text-sm font-medium text-gray-600">
              Lugares reservados
            </p>

            <p class="mt-3 text-3xl font-bold text-gray-950">
              {{ totalReservedSeats }}
            </p>

            <p class="mt-2 text-sm text-gray-500">
              Inscrições em eventos
            </p>
          </div>
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

        <div
          v-if="events.length"
          class="mt-12 grid gap-6 md:grid-cols-3"
        >
          <article
            v-for="event in events"
            :key="event.id"
            class="flex h-full flex-col rounded-2xl border border-amber-200 bg-white p-6 shadow-sm"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-amber-600">
                  {{ event.date }}
                </p>

                <h3 class="mt-3 text-xl font-bold text-gray-950">
                  {{ event.title }}
                </h3>
              </div>

              <UBadge
                v-if="event.status === 'open'"
                color="success"
                variant="soft"
              >
                Aberto
              </UBadge>

              <UBadge
                v-else-if="event.status === 'soon'"
                color="warning"
                variant="soft"
              >
                Em breve
              </UBadge>

              <UBadge
                v-else-if="event.status === 'sold_out'"
                color="error"
                variant="soft"
              >
                Esgotado
              </UBadge>

              <UBadge
                v-else
                color="neutral"
                variant="soft"
              >
                Fechado
              </UBadge>
            </div>

            <p class="mt-5 flex-1 leading-7 text-gray-700">
              {{ event.description }}
            </p>

            <div class="mt-5 flex items-center justify-between gap-4 text-sm text-gray-600">
              <span>{{ event.location }}</span>
              <span>{{ event.priceMember }}</span>
            </div>

            <UButton
              :to="`/agenda/${event.slug}`"
              class="mt-6"
              variant="outline"
              block
            >
              Ver detalhes
            </UButton>
          </article>
        </div>

        <SharedEmptyState
          v-else
          class="mt-12"
          icon="📅"
          title="Ainda não existem eventos em destaque"
          description="Quando forem criados eventos em destaque, vão aparecer nesta zona da página inicial."
          action-label="Ver agenda"
          action-to="/agenda"
        />

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
          <div
            v-for="benefit in benefits"
            :key="benefit.title"
            class="h-full rounded-2xl border border-amber-200 bg-white p-6 shadow-sm"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-3xl">
              {{ benefit.emoji }}
            </div>

            <h3 class="mt-5 text-lg font-bold text-gray-950">
              {{ benefit.title }}
            </h3>

            <p class="mt-3 leading-7 text-gray-700">
              {{ benefit.description }}
            </p>
          </div>
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
          <article
            v-for="post in latestPosts"
            :key="post.id"
            class="flex h-full flex-col overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm"
          >
            <div class="flex h-40 items-center justify-center bg-gray-50 text-5xl">
              {{ post.coverEmoji }}
            </div>

            <div class="flex flex-1 flex-col p-6">
              <p class="text-sm font-semibold text-amber-600">
                {{ post.category }}
              </p>

              <h3 class="mt-3 text-xl font-bold text-gray-950">
                {{ post.title }}
              </h3>

              <p class="mt-3 flex-1 leading-7 text-gray-700">
                {{ post.excerpt }}
              </p>

              <UButton
                :to="`/mural/${post.slug}`"
                class="mt-6"
                variant="outline"
              >
                Ver no mural
              </UButton>
            </div>
          </article>
        </div>

        <SharedEmptyState
          v-else
          class="mt-12"
          icon="🖼️"
          title="Ainda não existem publicações no mural"
          description="Quando forem publicadas memórias, fotografias ou rescaldos, vão aparecer nesta zona."
          action-label="Visitar o mural"
          action-to="/mural"
        />

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
        <div class="rounded-3xl bg-gray-950 px-6 py-14 text-center text-white shadow-sm sm:px-12">
          <p class="text-sm font-semibold uppercase tracking-wide text-amber-400">
            Junta-te à comunidade
          </p>

          <h2 class="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Queres ajudar a manter viva a comunidade de Fiolhais?
          </h2>

          <p class="mx-auto mt-4 max-w-2xl leading-7 text-gray-300">
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