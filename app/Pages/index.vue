<script setup lang="ts">
import { useKbd } from '@nuxt/ui/runtime/composables/useKbd.js';
import { useEvents } from '~/composables/useEvents'
const { getFeaturedEvents } = useEvents()

const events = getFeaturedEvents()


const benefits = [
  {
    title: 'Apoiar a associação',
    description: 'A tua contribuição ajuda a manter o CCD ativo e preparado para organizar novas iniciativas.',
    emoji: '🤝'
  },
  {
    title: 'Preservar tradições',
    description: 'Ser sócio é ajudar a manter vivas as festas, os convívios e os costumes de Fiolhais.',
    emoji: '🌿'
  },
  {
    title: 'Participar mais de perto',
    description: 'No futuro, os sócios poderão consultar quotas, inscrições e informações diretamente no portal.',
    emoji: '🎟️'
  }
]

const posts = [
    {
        title: 'Memórias dos convívios de Fiolhais',
        category: 'Fotografias',
        description: 'Galerias com fotografias dos convívios, festas e eventos da comunidade de Fiolhais.',
        emoji: '📸'
    },
    {
        title: 'Rescaldos dos eventos',
        category: 'Comunidade',
        description:'Publicações com o resumo dos melhores momentos de cada iniciativa',
        emoji: '📝'
    },
  {
    title: 'Tradições de Fiolhais',
    category: 'Cultura',
    description: 'Um espaço para valorizar a identidade, a história e as tradições locais.',
    emoji: '🏡'
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

                    <h1 class="mt-4 text-4xl font-bold tracking-tight text-gray-950 sm:text5x1">
                        A Casa da Comunidade, das Tradições e dos Eventos de Fiolhais
                    </h1>

                    <p class="mt-6 max-w-xl text-lg text-gray-600">
                        Uma plataforma digital para a comunidade de Fiolhais, onde pode encontrar informações sobre eventos, atividades culturais e desportivas, bem como aceder a recursos exclusivos para sócios. 
                    </p>

                    <div class="mt-8 flex flex-wrap gap-3">
                        <UButton to="/agenda" size="lg">
                            Ver Agenda
                        </UButton>

                        <UButton to="/socios/aderir" size="lg" variant="outline">
                            Tornar-me Sócio
                        </UButton>

                    </div>
                </div>

                <div class="rounded-3x1 border border-gray-200 bg-white p-6 shadow-sm">
                    <div class="rounded-2x1 bg-gray-100 p-8">
                        <p class="text-sm font-medium text-gray-500">
                            Próximo Destaque
                        </p>

                        <h2 class="mt-3 text-2x1 font-bold">
                            Agenda Cultural de Fiolhais
                        </h2>
                        <p>
                            Em breve vais encontrar informações sobre os próximos eventos culturais em Fiolhais.
                        </p>
                        
                        <UButton to="/agenda" class="mt-6" variant="outline">
                            Consultar Eventos
                        </UButton>
                    </div>
                </div>

            </UContainer>
        </section>

        <section class="py-20">
            <UContainer>

                <PublicSectionHeader eyebrow="Agenda" title="Próximos Eventos" description="Consulta os próximos convívios, festas, jantares e iniciativas organizadas pelo CCD Fiolhais"
                />

                <div class="mt-12 grid gap-6 md:grid-cols-3">
                    <PublicEventCard v-for="event in events"
                    :key="event.title"
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
                    <UButton to="/agenda" size="lg" variant="outline">
                    Ver Todos os Eventos
                    </UButton>
                </div>

            </UContainer>
        </section>

        <section class="bg-gray-50 py-20">

            <UContainer>

                <PublicSectionHeader eyebrow="Sócios" title="Porque tornar-se sócio?" description="Ser sócio é apoiar diretamente a comunidade, as tradições e o futuro do CCD Fiolhais"
                />

                <div class="mt-12 grid gap-6 md:grid-cols-3">
                    <UCard v-for="benefit in benefits" 
                    :key="benefit.title"
                    class="h-full"
                    >
                    <div class="text-4x1">
                        {{ benefit.emoji}}
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
                    <UButton to="/socios/aderir" size="lg">
                        Tornar-me Sócio 
                    </UButton>
                </div>

            </UContainer>
        </section>

        <section class="py-20">
            <UContainer>

                <PublicSectionHeader
                eyebrow="Memórias"
                title="Mural de Fiolhais"
                description="Um espaço para guardar fotografias, vídeos e rescaldos dos eventos da nossa comunidade"
                />

                <div class="mt-12 grid gap-6 md:grid-cols-3">
                    <PublicMuralCard
                    v-for="post in posts"
                    :key="post.title"
                    :title="post.title"
                    :category="post.category"
                    :description="post.description"
                    :emoji="post.emoji"
                    />
                </div>

                <div class="mt-10 text-center">
                    <UButton to="/mural" size="lg" variant="outline">
                        Visitar Mural
                    </UButton>
                </div>

            </UContainer>
        </section>

        <section class="py-20">
            <UContainer>
                <div class="rounded-3x1 bg-gray-950 px-6 py-14 text-center text-white sm:px-12">

                    <h2 class="text-3.1xl font-bold tracking-tight sm:text-4x1">
                        Queres ajudar a manter viva a comiunidade de Fiolhais?
                    </h2>

                    <p class="mx-auto mt-4 max-w-2x1 text-gray-300">
                        Junta-te a nós e torna-te sócio do CCD Fiolhais. A tua contribuição ajuda a manter as tradições, apoiar os eventos e fortalecer a comunidade.
                    </p>

                    <div class="mt-8 flex flex-wrap justify-center gap-3">
                        <UButton to="/socios/Aderir" size="lg" variant="outline">
                            Tornar-me Sócio
                        </UButton>

                        <UButton to="agenda" size="lg" color="neutral" variant="outline">
                            Ver Eventos
                        </UButton>

                    </div>

                </div>
            </UContainer>
        </section>

        </div>
</template>