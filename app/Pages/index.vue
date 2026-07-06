<script setup lang="ts">
import { useKbd } from '@nuxt/ui/runtime/composables/useKbd.js';

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

        <section>
            <UContainer class="py-16">

                <div class="grid gap-6 md:grid-cols-3">
                    <UCard>
                        <template #header>
                            Eventos
                        </template>

                        <p class="text-sm text-gray-600">
                            Divulgação de festas, jantares, convívios e atividades da comunidade.
                        </p>
                    </UCard>

                    <UCard>
                        <template #header>
                            Sócios
                        </template>

                        <p class="text-sm text-gray-600">
                            Inscrição de novos sócios e gestão futura de quotas e dados pessoais.
                        </p>
                    </UCard>

                    <UCard>
                        <template #header>
                            Memórias
                        </template>

                        <p class="text-sm text-gray-600">
                            Um moral para fotografias, vídeos e rescaldos dos eventos de Fiolhais.
                        </p>
                    </UCard>

                </div>

            </UContainer>
        </section>

    </div>
</template>
