<script setup lang="ts">
import {
  useSupabaseHome,
  type HomeData,
  type HomeEventStatus
} from '~/composables/useSupabaseHome'

const { getHomeData } = useSupabaseHome()

const homeData = ref<HomeData>({
  events: [],
  posts: []
})

const isLoading = ref(true)
const loadError = ref('')

useHead({
  title: 'Início'
})

const getStatusLabel = (
  status: HomeEventStatus
) => {
  if (status === 'open') {
    return 'Inscrições abertas'
  }

  if (status === 'soon') {
    return 'Brevemente'
  }

  if (status === 'sold_out') {
    return 'Esgotado'
  }

  if (status === 'closed') {
    return 'Fechado'
  }

  return 'Rascunho'
}

const getStatusClass = (
  status: HomeEventStatus
) => {
  if (status === 'open') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'soon') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  if (status === 'sold_out') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  return 'border-gray-200 bg-gray-50 text-gray-600'
}

const formatEventDate = (
  eventDate: string | undefined,
  dateLabel: string
) => {
  if (!eventDate) {
    return dateLabel
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(
    new Date(`${eventDate}T00:00:00`)
  )
}

const formatPostDate = (
  value?: string
) => {
  if (!value) {
    return ''
  }

  const date = value.includes('T')
    ? new Date(value)
    : new Date(`${value}T00:00:00`)

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const loadHome = async () => {
  isLoading.value = true
  loadError.value = ''

  const result = await getHomeData()

  isLoading.value = false

  if (!result.success) {
    loadError.value =
      result.error ||
      'Não foi possível carregar a informação.'

    return
  }

  homeData.value = result.data
}

onMounted(async () => {
  await loadHome()
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-[#080808] text-white">
      <div
        class="absolute inset-0 opacity-30"
        style="
          background:
            radial-gradient(
              circle at top right,
              rgba(201, 154, 30, 0.45),
              transparent 35%
            );
        "
      />

      <UContainer class="relative py-20 lg:py-28">
        <div class="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
              Centro Cultural e Desportivo de Fiolhais
            </p>

            <h1 class="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Cultura, desporto e comunidade em Fiolhais.
            </h1>

            <p class="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
              Um espaço de encontro para promover atividades culturais,
              desportivas e sociais, aproximando os habitantes e amigos
              de Fiolhais.
            </p>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <NuxtLink
                to="/agenda"
                class="rounded-xl bg-amber-500 px-6 py-3 text-center font-bold text-black transition hover:bg-amber-400"
              >
                Ver agenda
              </NuxtLink>

              <NuxtLink
                to="/socios/aderir"
                class="rounded-xl border border-amber-400 px-6 py-3 text-center font-bold text-amber-300 transition hover:bg-amber-400/10"
              >
                Tornar-me sócio
              </NuxtLink>
            </div>
          </div>

          <div class="flex justify-center lg:justify-end">
            <div
              class="flex h-72 w-72 items-center justify-center rounded-full border border-amber-400/30 bg-white/5 p-10 shadow-2xl backdrop-blur sm:h-80 sm:w-80"
            >
              <img
                src="/images/ccd-logo.png"
                alt="Centro Cultural e Desportivo de Fiolhais"
                class="max-h-full max-w-full object-contain"
              >
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Acessos -->
    <section class="bg-[#f8f4ea] py-12">
      <UContainer>
        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            to="/agenda"
            class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
          >
            <p class="text-3xl">
              📅
            </p>

            <h2 class="mt-4 text-xl font-bold text-gray-950">
              Agenda
            </h2>

            <p class="mt-2 leading-6 text-gray-600">
              Consulta os próximos eventos e atividades do CCD.
            </p>
          </NuxtLink>

          <NuxtLink
            to="/mural"
            class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
          >
            <p class="text-3xl">
              🖼️
            </p>

            <h2 class="mt-4 text-xl font-bold text-gray-950">
              Mural
            </h2>

            <p class="mt-2 leading-6 text-gray-600">
              Acompanha notícias, novidades e momentos da comunidade.
            </p>
          </NuxtLink>

          <NuxtLink
            to="/socios"
            class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
          >
            <p class="text-3xl">
              👥
            </p>

            <h2 class="mt-4 text-xl font-bold text-gray-950">
              Sócios
            </h2>

            <p class="mt-2 leading-6 text-gray-600">
              Conhece as vantagens e descobre como fazer parte da associação.
            </p>
          </NuxtLink>

          <NuxtLink
            to="/contactos"
            class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
          >
            <p class="text-3xl">
              ✉️
            </p>

            <h2 class="mt-4 text-xl font-bold text-gray-950">
              Contactos
            </h2>

            <p class="mt-2 leading-6 text-gray-600">
              Entra em contacto com a direção do CCD Fiolhais.
            </p>
          </NuxtLink>
        </div>
      </UContainer>
    </section>

    <!-- Loading / erro -->
    <section
      v-if="isLoading"
      class="bg-white py-16"
    >
      <UContainer>
        <div class="rounded-3xl border border-amber-200 bg-gray-50 p-10 text-center text-gray-600">
          A carregar novidades do CCD Fiolhais...
        </div>
      </UContainer>
    </section>

    <section
      v-else-if="loadError"
      class="bg-white py-16"
    >
      <UContainer>
        <div class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900">
          <p class="font-bold">
            Não foi possível carregar as novidades.
          </p>

          <p class="mt-2">
            {{ loadError }}
          </p>
        </div>
      </UContainer>
    </section>

    <template v-else>
      <!-- Eventos -->
      <section class="bg-white py-16 lg:py-20">
        <UContainer>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
                Agenda
              </p>

              <h2 class="mt-2 text-3xl font-black text-gray-950">
                Próximos eventos
              </h2>

              <p class="mt-3 max-w-2xl text-gray-600">
                Descobre as próximas atividades organizadas pelo CCD Fiolhais.
              </p>
            </div>

            <NuxtLink
              to="/agenda"
              class="font-bold text-amber-700 transition hover:text-amber-600"
            >
              Ver agenda completa →
            </NuxtLink>
          </div>

          <div
            v-if="homeData.events.length"
            class="mt-10 grid gap-6 lg:grid-cols-3"
          >
            <article
              v-for="event in homeData.events"
              :key="event.id"
              class="flex flex-col overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div class="flex h-44 items-center justify-center bg-gray-50 text-7xl">
                {{ event.imageEmoji }}
              </div>

              <div class="flex flex-1 flex-col p-6">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-xs font-bold uppercase tracking-wide text-amber-600">
                    {{ event.category }}
                  </span>

                  <span
                    class="rounded-full border px-2.5 py-1 text-xs font-bold"
                    :class="getStatusClass(event.status)"
                  >
                    {{ getStatusLabel(event.status) }}
                  </span>
                </div>

                <h3 class="mt-4 text-xl font-bold text-gray-950">
                  {{ event.title }}
                </h3>

                <p class="mt-3 line-clamp-3 leading-7 text-gray-600">
                  {{ event.description }}
                </p>

                <div class="mt-5 space-y-2 text-sm text-gray-600">
                  <p>
                    📅
                    {{ formatEventDate(event.eventDate, event.dateLabel) }}
                  </p>

                  <p>
                    🕒
                    {{ event.timeLabel || event.eventTime || 'Hora a anunciar' }}
                  </p>

                  <p>
                    📍
                    {{ event.location }}
                  </p>
                </div>

                <div class="mt-auto pt-6">
                  <NuxtLink
                    :to="`/agenda/${event.slug}`"
                    class="inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
                  >
                    Ver evento
                  </NuxtLink>
                </div>
              </div>
            </article>
          </div>

          <div
            v-else
            class="mt-10 rounded-3xl border border-amber-200 bg-[#f8f4ea] p-8 text-center"
          >
            <p class="text-4xl">
              📅
            </p>

            <h3 class="mt-4 text-xl font-bold text-gray-950">
              Ainda não existem eventos anunciados
            </h3>

            <p class="mt-2 text-gray-600">
              Os próximos eventos serão publicados aqui.
            </p>
          </div>
        </UContainer>
      </section>

      <!-- Mural -->
      <section class="bg-[#f8f4ea] py-16 lg:py-20">
        <UContainer>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
                Comunidade
              </p>

              <h2 class="mt-2 text-3xl font-black text-gray-950">
                Últimas publicações
              </h2>

              <p class="mt-3 max-w-2xl text-gray-600">
                Notícias e momentos recentes do CCD Fiolhais.
              </p>
            </div>

            <NuxtLink
              to="/mural"
              class="font-bold text-amber-700 transition hover:text-amber-600"
            >
              Ver todo o mural →
            </NuxtLink>
          </div>

          <div
            v-if="homeData.posts.length"
            class="mt-10 grid gap-6 lg:grid-cols-3"
          >
            <article
              v-for="post in homeData.posts"
              :key="post.id"
              class="flex flex-col rounded-3xl border border-amber-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-3xl">
                  {{ post.coverEmoji }}
                </div>

                <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  {{ post.category }}
                </span>
              </div>

              <h3 class="mt-5 text-xl font-bold text-gray-950">
                {{ post.title }}
              </h3>

              <p class="mt-3 flex-1 leading-7 text-gray-600">
                {{ post.excerpt }}
              </p>

              <p
                v-if="post.publishedAt"
                class="mt-5 text-sm text-gray-500"
              >
                {{ formatPostDate(post.publishedAt) }}
              </p>

              <NuxtLink
                :to="`/mural/${post.slug}`"
                class="mt-5 font-bold text-amber-700 transition hover:text-amber-600"
              >
                Ler publicação →
              </NuxtLink>
            </article>
          </div>

          <div
            v-else
            class="mt-10 rounded-3xl border border-amber-200 bg-white p-8 text-center"
          >
            <p class="text-4xl">
              🖼️
            </p>

            <h3 class="mt-4 text-xl font-bold text-gray-950">
              Ainda não existem publicações
            </h3>

            <p class="mt-2 text-gray-600">
              As novidades do CCD serão publicadas aqui.
            </p>
          </div>
        </UContainer>
      </section>
    </template>

    <!-- Sócios -->
    <section class="bg-[#0f172a] py-16 text-white lg:py-20">
      <UContainer>
        <div class="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.18em] text-amber-400">
              Fazer parte
            </p>

            <h2 class="mt-3 text-3xl font-black sm:text-4xl">
              Junta-te ao CCD Fiolhais
            </h2>

            <p class="mt-4 max-w-2xl text-lg leading-8 text-gray-300">
              Ao tornares-te sócio contribuis para o desenvolvimento das
              atividades culturais, desportivas e comunitárias da associação.
            </p>
          </div>

          <NuxtLink
            to="/socios/aderir"
            class="rounded-xl bg-amber-500 px-7 py-4 text-center font-bold text-black transition hover:bg-amber-400"
          >
            Quero ser sócio
          </NuxtLink>
        </div>
      </UContainer>
    </section>

    <!-- Associação -->
    <section class="bg-white py-16 lg:py-20">
      <UContainer>
        <div class="mx-auto max-w-4xl text-center">
          <p class="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            CCD Fiolhais
          </p>

          <h2 class="mt-3 text-3xl font-black text-gray-950">
            Uma associação ao serviço da comunidade
          </h2>

          <p class="mt-5 text-lg leading-8 text-gray-600">
            O Centro Cultural e Desportivo de Fiolhais promove iniciativas
            que incentivam o convívio, a participação e a valorização da
            comunidade local.
          </p>

          <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <NuxtLink
              to="/sobre"
              class="rounded-xl border border-amber-500 px-6 py-3 font-bold text-amber-700 transition hover:bg-amber-50"
            >
              Conhecer o CCD
            </NuxtLink>

            <NuxtLink
              to="/contactos"
              class="rounded-xl border border-gray-300 px-6 py-3 font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Contactar
            </NuxtLink>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>